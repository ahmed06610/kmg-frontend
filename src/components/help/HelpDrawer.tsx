"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/Icon";
import { HELP_CONTENT, type HelpSection, type PageHelp } from "@/lib/help-content";
import { cn } from "@/lib/utils";

function matches(text: string, term: string) {
  return text.toLowerCase().includes(term);
}

function sectionMatches(section: HelpSection, term: string) {
  return (
    matches(section.title, term) ||
    matches(section.intro ?? "", term) ||
    (section.steps ?? []).some((s) => matches(s, term)) ||
    (section.notes ?? []).some((n) => matches(n, term))
  );
}

function SectionCard({ section, index, open, onToggle }: { section: HelpSection; index: number; open: boolean; onToggle: () => void }) {
  return (
    <div id={`help-section-${index}`} className="rounded-lg border border-outline-variant bg-surface-container-lowest overflow-hidden">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between gap-2 px-stack-md py-stack-sm text-right hover:bg-surface-container-low">
        <span className="flex items-center gap-2 text-body-sm font-semibold text-on-surface">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary shrink-0">
            <Icon name={section.icon} size={16} />
          </span>
          {section.title}
        </span>
        <Icon name={open ? "expand_less" : "expand_more"} size={20} className="text-on-surface-variant shrink-0" />
      </button>
      {open && (
        <div className="px-stack-md pb-stack-md pt-1 flex flex-col gap-stack-sm text-body-sm text-on-surface">
          {section.intro && <p className="text-on-surface-variant">{section.intro}</p>}
          {section.steps && (
            <ol className="flex flex-col gap-2">
              {section.steps.map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-surface-container-high text-[11px] font-semibold text-on-surface-variant shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          )}
          {section.notes?.map((note, i) => (
            <div key={i} className="flex gap-2 rounded bg-warning-container/50 px-stack-sm py-2 text-on-surface">
              <Icon name="info" size={16} className="text-warning shrink-0 mt-0.5" />
              <span>{note}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-outline-variant last:border-b-0">
      <button type="button" onClick={onToggle} className="w-full flex items-start justify-between gap-2 py-stack-sm text-right">
        <span className="flex items-start gap-2 text-body-sm font-semibold text-on-surface">
          <Icon name="help" size={16} className="text-primary shrink-0 mt-0.5" />
          {q}
        </span>
        <Icon name={open ? "remove" : "add"} size={18} className="text-on-surface-variant shrink-0" />
      </button>
      {open && <p className="pb-stack-sm pr-6 text-body-sm text-on-surface-variant">{a}</p>}
    </div>
  );
}

/** لوحة جانبية بتعرض شرح تفصيلي لصفحة معينة: أقسام "إزاي تعمل كذا" خطوة بخطوة + أسئلة شائعة + بحث جوه الشرح */
export function HelpDrawer({ href, open, onClose }: { href: string | null; open: boolean; onClose: () => void }) {
  const help: PageHelp | undefined = href ? HELP_CONTENT[href] : undefined;
  const [search, setSearch] = useState("");
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set());

  // التصفير بيحصل بس لما الدرج يتفتح أو الصفحة تتغير - مش مع كل render (onClose بيتغير كل مرة)
  useEffect(() => {
    if (!open) return;
    setSearch("");
    setOpenSections(new Set([0]));
    setOpenFaqs(new Set());
  }, [open, href]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const term = search.trim().toLowerCase();
  const visibleSections = useMemo(
    () => (help ? help.sections.map((s, i) => ({ s, i })).filter(({ s }) => !term || sectionMatches(s, term)) : []),
    [help, term],
  );
  const visibleFaqs = useMemo(
    () => (help ? help.faqs.map((f, i) => ({ f, i })).filter(({ f }) => !term || matches(f.q, term) || matches(f.a, term)) : []),
    [help, term],
  );

  if (!open || !help) return null;

  const toggle = (set: Set<number>, setter: (s: Set<number>) => void, i: number) => {
    const next = new Set(set);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setter(next);
  };

  // أثناء البحث كل الأقسام والأسئلة المطابقة بتتفتح تلقائيًا عشان النتيجة تبان على طول
  const isSectionOpen = (i: number) => !!term || openSections.has(i);
  const isFaqOpen = (i: number) => !!term || openFaqs.has(i);

  // Portal على body: السايد بار نفسه fixed بـ z-index، فلو الدرج اترسم جواه هيتحبس في نفس الطبقة وممكن التوب بار يغطيه
  return createPortal(
    <div className="fixed inset-0 z-50" data-print-hide>
      <div className="fixed inset-0 bg-on-background/30 backdrop-blur-sm" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`شرح صفحة ${help.title}`}
        className="dropdown-in fixed left-0 top-0 h-full w-[460px] max-w-[95vw] flex flex-col bg-surface border-r border-outline-variant shadow-2xl"
      >
        <header className="px-stack-lg pt-stack-lg pb-stack-md border-b border-outline-variant bg-surface-container-lowest shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-on-primary shrink-0">
                <Icon name={help.icon} size={22} />
              </span>
              <div>
                <p className="text-xs text-on-surface-variant">دليل الاستخدام</p>
                <h2 className="text-title-sm text-on-surface">شرح صفحة {help.title}</h2>
              </div>
            </div>
            <button type="button" onClick={onClose} className="text-on-surface-variant hover:text-on-surface" aria-label="إغلاق">
              <Icon name="close" />
            </button>
          </div>
          <p className="text-body-sm text-on-surface-variant mt-stack-sm">{help.summary}</p>
          <div className="relative mt-stack-md">
            <Icon name="search" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في الشرح... (مثلًا: تعديل، حذف، شيك)"
              className="w-full rounded-lg bg-surface-container-low border border-outline-variant pr-9 pl-3 py-2 text-body-sm outline-none focus:border-primary"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-stack-lg py-stack-md flex flex-col gap-stack-md">
          {!term && (
            <div className="flex flex-wrap gap-1.5">
              {help.sections.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setOpenSections((prev) => new Set(prev).add(i));
                    requestAnimationFrame(() => document.getElementById(`help-section-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
                  }}
                  className="text-xs rounded-full border border-outline-variant px-2.5 py-1 text-on-surface-variant hover:border-primary hover:text-primary"
                >
                  {s.title}
                </button>
              ))}
            </div>
          )}

          {visibleSections.length > 0 && (
            <div className="flex flex-col gap-stack-sm">
              <p className="text-label-caps text-on-surface-variant">إزاي تعمل...</p>
              {visibleSections.map(({ s, i }) => (
                <SectionCard key={i} section={s} index={i} open={isSectionOpen(i)} onToggle={() => toggle(openSections, setOpenSections, i)} />
              ))}
            </div>
          )}

          {visibleFaqs.length > 0 && (
            <div className="flex flex-col">
              <p className="text-label-caps text-on-surface-variant mb-1">أسئلة شائعة</p>
              <div className="rounded-lg border border-outline-variant bg-surface-container-lowest px-stack-md">
                {visibleFaqs.map(({ f, i }) => (
                  <FaqItem key={i} q={f.q} a={f.a} open={isFaqOpen(i)} onToggle={() => toggle(openFaqs, setOpenFaqs, i)} />
                ))}
              </div>
            </div>
          )}

          {term && visibleSections.length === 0 && visibleFaqs.length === 0 && (
            <p className="text-body-sm text-on-surface-variant text-center py-stack-lg">مفيش نتائج لـ &quot;{search}&quot; في شرح الصفحة دي</p>
          )}
        </div>
      </aside>
    </div>,
    document.body,
  );
}

/** زرار صغير "؟" بيفتح شرح صفحة معينة - بيتحط جنب كل عنصر في السايد بار */
export function HelpButton({ href, label, className }: { href: string; label: string; className?: string }) {
  const [open, setOpen] = useState(false);
  if (!HELP_CONTENT[href]) return null;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        title={`شرح صفحة ${label}`}
        aria-label={`شرح صفحة ${label}`}
        className={cn("flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition-colors", className)}
      >
        <Icon name="help" size={18} />
      </button>
      <HelpDrawer href={href} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
