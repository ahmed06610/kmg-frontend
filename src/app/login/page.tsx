import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { AnimatedLogo } from "@/components/ui/AnimatedLogo";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-gutter">
      <div className="w-full max-w-sm">
        <div className="text-center mb-stack-lg">
          <AnimatedLogo size={56} className="mx-auto mb-stack-sm" />
          <h1 className="text-headline-md text-on-surface">KMG</h1>
          <p className="text-body-sm text-on-surface-variant">نظام إدارة الأعمال الداخلي</p>
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
