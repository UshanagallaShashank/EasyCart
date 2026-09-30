// Standard styled input component with number-field auto-select and zero-clearing.
import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, onFocus, onClick, onChange, ...props }: React.ComponentProps<"input">) {
  function handle_focus(e: React.FocusEvent<HTMLInputElement>) {
    if (type === "number") {
      e.target.select();
    }
    onFocus?.(e);
  }

  function handle_click(e: React.MouseEvent<HTMLInputElement>) {
    if (type === "number" && (e.currentTarget.value === "0" || e.currentTarget.value === "0.00")) {
      e.currentTarget.select();
    }
    onClick?.(e);
  }

  function handle_change(e: React.ChangeEvent<HTMLInputElement>) {
    if (type === "number" && /^0[0-9]/.test(e.target.value)) {
      e.target.value = e.target.value.replace(/^0+(?=\d)/, '');
    }
    onChange?.(e);
  }

  return (
    <input
      type={type}
      data-slot="input"
      onFocus={handle_focus}
      onClick={handle_click}
      onChange={handle_change}
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
