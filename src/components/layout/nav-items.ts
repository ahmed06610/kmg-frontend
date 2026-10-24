export interface NavItem {
  href: string;
  /** النص العربي - بيتترجم وقت العرض بـ t() (ده مفتاح الترجمة) */
  label: string;
  /** اسم أقصر لتابات الموبايل اللي تحت */
  shortLabel?: string;
  icon: string;
  ability: string;
  /** يظهر كتاب في شريط الموبايل اللي تحت (أول 4 مسموحين للمستخدم بس) */
  mobileTab?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "لوحة التحكم", shortLabel: "الرئيسية", icon: "dashboard", ability: "عرض لوحة التحكم", mobileTab: true },
  { href: "/projects", label: "المشاريع", icon: "account_tree", ability: "عرض المشاريع", mobileTab: true },
  { href: "/stock", label: "المخزون", icon: "inventory_2", ability: "عرض المخزن", mobileTab: true },
  { href: "/cashbox", label: "الخزنة", icon: "account_balance_wallet", ability: "عرض الخزنة", mobileTab: true },
  { href: "/payroll", label: "الرواتب", icon: "payments", ability: "إدارة الرواتب", mobileTab: true },
  { href: "/suppliers", label: "الموردين", icon: "local_shipping", ability: "عرض الموردين" },
  { href: "/clients", label: "العملاء", icon: "groups", ability: "عرض العملاء" },
  { href: "/employees", label: "الموظفين", icon: "badge", ability: "عرض الموظفين" },
  { href: "/invoices", label: "الفواتير", icon: "receipt_long", ability: "إدارة الفواتير" },
  { href: "/ai-chat", label: "مساعد AI", icon: "forum", ability: "إدارة تكامل AI" },
  { href: "/ai-tenders", label: "مناقصات AI", icon: "request_quote", ability: "إدارة تكامل AI" },
];

export function isNavItemActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
