import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

// Route Handler - مسموح فيه تعديل الكوكيز (على عكس الـ Server Components)
// بيتنادى لما جلسة المستخدم تبقى غير صالحة (توكين منتهي أو حساب مش موجود بعد تصفير الداتابيز)
export async function GET(request: NextRequest) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/login?sessionExpired=1", request.url));
}
