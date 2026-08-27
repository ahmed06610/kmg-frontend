import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-gutter">
      <div className="w-full max-w-sm">
        <div className="text-center mb-stack-lg">
          <div className="inline-flex w-14 h-14 items-center justify-center rounded-xl bg-primary text-on-primary text-headline-md font-bold mb-stack-sm">
            K
          </div>
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
