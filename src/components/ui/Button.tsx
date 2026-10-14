import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary/90 shadow-sm",
  secondary: "bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-high",
  danger: "bg-error text-on-error hover:bg-on-error-container shadow-sm",
  ghost: "text-on-surface-variant hover:bg-surface-container-high",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-body-sm",
  md: "px-6 py-2.5 text-title-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 ease-in-out disabled:cursor-not-allowed disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
