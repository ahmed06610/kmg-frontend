import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { LanguageToggle, ThemeToggle } from "@/components/layout/PreferenceToggles";
import { AnimatedLogo } from "@/components/ui/AnimatedLogo";
import { getT } from "@/lib/i18n/server";

export default async function LoginPage() {
  const t = await getT();
  return (
    <div className="relative min-h-dvh flex items-center justify-center bg-background px-4 sm:px-gutter py-16">
      {/* تبديل اللغة والثيم متاح قبل تسجيل الدخول كمان */}
      <div className="absolute top-4 end-4 flex items-center gap-2">
        <LanguageToggle showLabel />
        <ThemeToggle className="border border-outline-variant" />
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-stack-lg">
          <AnimatedLogo size={56} className="mx-auto mb-stack-sm" />
          <h1 className="text-headline-md text-on-surface">KMG</h1>
          <p className="text-body-sm text-on-surface-variant">{t("نظام إدارة الأعمال الداخلي")}</p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg shadow-[var(--shadow-elevated)]">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
