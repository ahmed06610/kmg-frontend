import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: { position: "bottom-right" },
  // التجربة من الموبايل على نفس الشبكة (dev بس) - من غيرها Next بيمنع ملفات الـ JS فالصفحة متبقاش تفاعلية
  allowedDevOrigins: ["192.168.*.*"],
};

export default nextConfig;
