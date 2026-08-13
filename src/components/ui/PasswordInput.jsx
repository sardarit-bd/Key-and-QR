import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

/**
 * PasswordInput – a reusable component that wraps the project's Input
 * and adds a show/hide toggle using Eye/EyeOff icons.
 *
 * Props are forwarded to the underlying Input component.
 */
export function PasswordInput({ className, ...props }) {
  const [show, setShow] = React.useState(false);
  const toggleShow = () => setShow((v) => !v);
  return (
    <div className="relative flex items-center">
      <Input
        type={show ? "text" : "password"}
        className={cn("pr-10", className)}
        {...props}
      />
      <button
        type="button"
        aria-label={show ? "Hide password" : "Show password"}
        onClick={toggleShow}
        onMouseDown={(e) => e.preventDefault()}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
