import Image from "next/image";
import { CurrentPageHelp } from "@/components/help/CurrentPageHelp";
import { getT } from "@/lib/i18n/server";
import { NotificationBell } from "./NotificationBell";
import { LanguageToggle, ThemeToggle } from "./PreferenceToggles";

export async function Topbar({ roleName, username }: { roleName: string; username: string }) {
  // اسم الدور جاي من الباك اند بالعربي (صاحب العمل / المحاسب)
  const t = await getT();
  return (
    <header
      data-print-hide
      className="sticky top-0 z-20 flex h-14 md:h-16 items-center justify-between gap-2 border-b border-outline-variant bg-surface/90 backdrop-blur px-4 sm:px-6 md:px-container-margin"
    >
      <div className="flex items-center gap-2 min-w-0">
        {/* على الموبايل مفيش سايد بار، فاللوجو بيظهر هنا */}
        <Image src="/logo-mark.png" alt="KMG" width={28} height={28} className="md:hidden shrink-0 object-contain" />
        <div className="hidden md:block min-w-0 leading-tight">
          <p className="text-body-sm font-semibold text-on-surface truncate">{username}</p>
          <p className="text-xs text-on-surface-variant truncate">{t(roleName)}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <CurrentPageHelp />
        <LanguageToggle className="px-2.5 sm:px-3" />
        <ThemeToggle />
        <NotificationBell />
        <div
          title={username}
          className="hidden md:flex w-9 h-9 rounded-full bg-primary/15 text-primary items-center justify-center text-body-sm font-semibold"
        >
          {username.charAt(0).toUpperCase() || "?"}
        </div>
      </div>
    </header>
  );
}
