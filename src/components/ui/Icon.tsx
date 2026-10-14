import { cn } from "@/lib/utils";

interface IconProps {
  name: string;
  filled?: boolean;
  size?: number;
  className?: string;
}

export function Icon({ name, filled, size = 20, className }: IconProps) {
  return (
    <span
      className={cn("material-symbols-outlined", filled && "filled", className)}
      style={{ fontSize: size }}
    >
      {name}
    </span>
  );
}
