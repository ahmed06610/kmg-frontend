import { cn } from "@/lib/utils";

interface IconProps {
  name: string;
  filled?: boolean;
  size?: number;
  className?: string;
}

// أيقونات ليها اتجاه أفقي: الواجهة اتصممت RTL (مثلًا arrow_back بمعنى "التالي")، فلما الصفحة تبقى
// إنجليزي (LTR) بنعكسها أفقيًا عشان المعنى يفضل زي ما هو
const DIRECTIONAL_ICONS = new Set([
  "arrow_back",
  "arrow_forward",
  "arrow_back_ios",
  "arrow_forward_ios",
  "chevron_left",
  "chevron_right",
  "keyboard_arrow_left",
  "keyboard_arrow_right",
  "first_page",
  "last_page",
  "east",
  "west",
]);

export function Icon({ name, filled, size = 20, className }: IconProps) {
  return (
    <span
      className={cn("material-symbols-outlined", filled && "filled", DIRECTIONAL_ICONS.has(name) && "ltr:-scale-x-100", className)}
      style={{ fontSize: size }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
