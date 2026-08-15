import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function PasswordInput({ className, ...props }) {
  const [show, setShow] = React.useState(false);
  const inputRef = React.useRef(null);
  const selectionRef = React.useRef(null);

  const handleToggle = () => {
    const input = inputRef.current;

    if (input) {
      selectionRef.current = {
        start: input.selectionStart,
        end: input.selectionEnd,
      };
    }

    setShow((prev) => !prev);

    requestAnimationFrame(() => {
      const currentInput = inputRef.current;
      const selection = selectionRef.current;

      if (!currentInput || !selection) return;

      currentInput.focus();

      currentInput.setSelectionRange(
        selection.start,
        selection.end
      );
    });
  };

  return (
    <div className="relative w-full">
      <Input
        {...props}
        ref={inputRef}
        type={show ? "text" : "password"}
        className={cn("w-full pr-11", className)}
      />

      <button
        type="button"
        aria-label={show ? "Hide password" : "Show password"}
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleToggle}
        className="
          absolute right-3 top-1/2 -translate-y-1/2
          flex items-center justify-center
          p-1
          text-gray-500
          hover:text-gray-900
          transition-colors
          rounded
          focus:outline-none
          cursor-pointer
        "
      >
        {show ? (
          <EyeOff size={18} />
        ) : (
          <Eye size={18} />
        )}
      </button>
    </div>
  );
}