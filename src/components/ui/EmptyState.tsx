import { Icon } from "./Icon";

export function EmptyState({ icon = "inbox", title, description }: { icon?: string; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-stack-sm py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center">
        <Icon name={icon} size={28} className="text-on-surface-variant" />
      </div>
      <p className="text-title-sm text-on-surface">{title}</p>
      {description && <p className="text-body-sm text-on-surface-variant max-w-sm">{description}</p>}
    </div>
  );
}
