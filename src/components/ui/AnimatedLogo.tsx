import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface AnimatedLogoProps {
  size?: number;
  className?: string;
}

type LogoStyle = CSSProperties & { "--logo-mask-image": string };

/** نسخة متحركة من لوجو الشركة - بريق بيمشي جوه شكل اللوجو نفسه، بتستخدم كمؤشر تحميل رايق */
export function AnimatedLogo({ size = 56, className }: AnimatedLogoProps) {
  const style: LogoStyle = {
    width: size,
    height: size,
    "--logo-mask-image": "url(/logo-mark.png)",
  };

  return <span role="img" aria-label="KMG" className={cn("animated-logo inline-block shrink-0", className)} style={style} />;
}
