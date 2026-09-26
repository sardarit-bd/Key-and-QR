'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

/**
 * Modern Luxury Visual View for Admin Search Input
 */
const SearchInputView = forwardRef(function SearchInputView(
  {
    value,
    onChange,
    onClear,
    placeholder = 'Search...',
    isLoading = false,
    showClear = true,
    enableShortcut = true,
    className = '',
    inputClassName = '',
    disabled = false,
    autoFocus = false,
    onKeyDown,
    ...props
  },
  ref
) {
  const inputRef = useRef(null);
  useImperativeHandle(ref, () => inputRef.current);

  const [shortcutKey, setShortcutKey] = useState('Ctrl K');

  // Detect Mac vs Windows/Linux for keyboard shortcut badge
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMac = /(Mac|iPhone|iPod|iPad)/i.test(
        navigator.userAgent || navigator.platform || ''
      );
      setShortcutKey(isMac ? '⌘K' : 'Ctrl K');
    }
  }, []);

  // Global keyboard shortcut listener (Ctrl+K or ⌘+K)
  useEffect(() => {
    if (!enableShortcut || disabled) return;

    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key?.toLowerCase() === 'k') {
        // Prevent default browser URL bar focus or action
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select?.();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [enableShortcut, disabled]);

  // Handle local keydown events (e.g., Escape to clear or blur)
  const handleInputKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (value) {
        e.preventDefault();
        onClear?.();
      } else {
        inputRef.current?.blur();
      }
    }
    onKeyDown?.(e);
  };

  return (
    <div
      className={cn(
        'group relative flex items-center w-full min-w-[240px] max-w-md h-10 px-3.5 rounded-xl bg-neutral-900/80 border border-white/10 hover:border-white/20 transition-all duration-200 focus-within:border-amber-500/50 focus-within:ring-2 focus-within:ring-amber-500/20 shadow-sm backdrop-blur-md',
        disabled && 'opacity-60 cursor-not-allowed pointer-events-none',
        className
      )}
    >
      {/* Modern Muted Left Search Icon with Amber Light-Up on Focus */}
      <Search
        size={16}
        className="text-neutral-500 group-focus-within:text-amber-400 transition-colors shrink-0 mr-2.5 pointer-events-none"
      />

      {/* Raw Frameless Transparent Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(
          'w-full bg-transparent text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none border-none p-0 tracking-normal',
          inputClassName
        )}
        {...props}
      />

      {/* Quick Action Accessories (Right Side) */}
      <div className="flex items-center shrink-0 ml-2">
        {isLoading ? (
          <Loader2
            size={15}
            className="animate-spin text-amber-400 pointer-events-none"
          />
        ) : showClear && value ? (
          <button
            type="button"
            onClick={onClear}
            className="hover:bg-white/10 rounded-md p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        ) : enableShortcut ? (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-white/10 text-[10px] font-mono text-neutral-400 select-none bg-white/[0.03]">
            {shortcutKey}
          </kbd>
        ) : null}
      </div>
    </div>
  );
});

/**
 * Controlled Mode Implementation (Callback based, zero lag local buffer, debounced output)
 */
const AdminSearchInputControlled = forwardRef(function AdminSearchInputControlled(
  {
    value: controlledValue = '',
    onChange,
    onImmediateChange,
    delay = 400,
    ...rest
  },
  ref
) {
  const [internalValue, setInternalValue] = useState(controlledValue ?? '');
  const debouncedValue = useDebounce(internalValue, delay);
  const prevControlledRef = useRef(controlledValue);
  const isFirstRender = useRef(true);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onImmediateChangeRef = useRef(onImmediateChange);
  onImmediateChangeRef.current = onImmediateChange;

  // Sync if external value is changed (e.g. parent clears all filters)
  useEffect(() => {
    if (controlledValue !== prevControlledRef.current) {
      prevControlledRef.current = controlledValue;
      setInternalValue(controlledValue ?? '');
    }
  }, [controlledValue]);

  // Emit debounced value to parent
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (debouncedValue !== prevControlledRef.current) {
      prevControlledRef.current = debouncedValue;
      onChangeRef.current?.(debouncedValue);
    }
  }, [debouncedValue]);

  const handleChange = (e) => {
    const val = e.target.value;
    setInternalValue(val);
    onImmediateChangeRef.current?.(val);
  };

  const handleClear = useCallback(() => {
    setInternalValue('');
    prevControlledRef.current = '';
    onImmediateChangeRef.current?.('');
    onChangeRef.current?.(''); // Instantly notify parent without waiting for debounce delay
  }, []);

  return (
    <SearchInputView
      ref={ref}
      value={internalValue}
      onChange={handleChange}
      onClear={handleClear}
      {...rest}
    />
  );
});

/**
 * URL Mode Implementation (Syncs ?search=... with Next.js router)
 */
const AdminSearchInputUrl = forwardRef(function AdminSearchInputUrl(
  {
    queryParam = 'search',
    pageParam = 'page',
    delay = 400,
    onImmediateChange,
    onChange,
    ...rest
  },
  ref
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQuery = searchParams?.get(queryParam) || '';
  const [internalValue, setInternalValue] = useState(urlQuery);
  const debouncedValue = useDebounce(internalValue, delay);
  const isFirstRender = useRef(true);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onImmediateChangeRef = useRef(onImmediateChange);
  onImmediateChangeRef.current = onImmediateChange;

  // Sync if URL changed from external source (e.g. back/forward navigation)
  useEffect(() => {
    if (urlQuery !== internalValue && !isFirstRender.current) {
      setInternalValue(urlQuery);
    }
  }, [urlQuery]);

  // Sync debounced value to URL query param
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const currentUrlVal = searchParams?.get(queryParam) || '';
    if (debouncedValue.trim() === currentUrlVal) return;

    const params = new URLSearchParams(searchParams?.toString() || '');
    if (debouncedValue.trim()) {
      params.set(queryParam, debouncedValue.trim());
    } else {
      params.delete(queryParam);
    }
    if (pageParam) {
      params.set(pageParam, '1'); // Reset to page 1 on new search
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    onChangeRef.current?.(debouncedValue);
  }, [debouncedValue, pathname, queryParam, pageParam, router, searchParams]);

  const handleChange = (e) => {
    const val = e.target.value;
    setInternalValue(val);
    onImmediateChangeRef.current?.(val);
  };

  const handleClear = useCallback(() => {
    setInternalValue('');
    onImmediateChangeRef.current?.('');
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.delete(queryParam);
    if (pageParam) params.set(pageParam, '1');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    onChangeRef.current?.('');
  }, [searchParams, queryParam, pageParam, router, pathname]);

  return (
    <SearchInputView
      ref={ref}
      value={internalValue}
      onChange={handleChange}
      onClear={handleClear}
      {...rest}
    />
  );
});

/**
 * Universal AdminSearchInput component
 * Supports both `mode="controlled"` and `mode="url"`, with 60fps local buffering,
 * keyboard shortcut support (Ctrl+K / ⌘K), instant clear, and luxury dark SaaS styling.
 */
const AdminSearchInput = forwardRef(function AdminSearchInput(
  { mode = 'controlled', ...props },
  ref
) {
  if (mode === 'url') {
    return <AdminSearchInputUrl ref={ref} {...props} />;
  }
  return <AdminSearchInputControlled ref={ref} {...props} />;
});

export default AdminSearchInput;
