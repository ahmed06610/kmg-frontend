import { Icon } from "@/components/ui/Icon";
import { MobileNav } from "./MobileNav";
import { NotificationBell } from "./NotificationBell";

export function Topbar({ roleName, username, abilities }: { roleName: string; username: string; abilities: string[] }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-outline-variant bg-surface px-container-margin">
      <div className="flex items-center gap-2">
        <MobileNav abilities={abilities} />
        <NotificationBell />
        <div className="hidden sm:flex items-center gap-2 text-on-surface-variant">
          <Icon name="badge" size={18} />
          <span className="text-body-sm">{roleName}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-body-sm text-on-surface hidden sm:inline">{username}</span>
        <div className="w-9 h-9 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center text-body-sm font-semibold text-on-surface">
          {username.charAt(0).toUpperCase() || "?"}
        </div>
      </div>
    </header>
  );
}
