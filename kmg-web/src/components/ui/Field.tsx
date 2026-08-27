import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

function fieldClasses(hasError?: boolean) {
  return cn(
    "w-full rounded bg-surface-container-lowest border p-stack-md text-body-sm outline-none transition-all",
    "focus:border-primary focus:ring-2 focus:ring-primary/20",
    hasError ? "border-error" : "border-outline-variant",
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-label-caps text-on-surface-variant text-right block mb-1", className)} {...props} />;
}

export function ErrorText({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="text-error text-xs mt-1">{children}</p>;
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => (
  <input ref={ref} className={cn(fieldClasses(!!error), className)} {...props} />
));
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, error, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldClasses(!!error), className)} {...props} />
));
Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, error, children, ...props }, ref) => (
  <select ref={ref} className={cn(fieldClasses(!!error), className)} {...props}>
    {children}
  </select>
));
Select.displayName = "Select";

export function FieldGroup({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      {children}
      <ErrorText>{error}</ErrorText>
    </div>
  );
}
