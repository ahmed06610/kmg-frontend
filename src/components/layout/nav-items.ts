export interface NavItem {
  href: string;
  label: string;
  icon: string;
  ability: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "لوحة التحكم", icon: "dashboard", ability: "عرض لوحة التحكم" },
  { href: "/projects", label: "المشاريع", icon: "account_tree", ability: "عرض المشاريع" },
  { href: "/stock", label: "المخزون", icon: "inventory_2", ability: "عرض المخزن" },
  { href: "/suppliers", label: "الموردين", icon: "local_shipping", ability: "عرض الموردين" },
  { href: "/clients", label: "العملاء", icon: "groups", ability: "عرض العملاء" },
  { href: "/employees", label: "الموظفين", icon: "badge", ability: "عرض الموظفين" },
  { href: "/payroll", label: "الرواتب", icon: "payments", ability: "إدارة الرواتب" },
  { href: "/cashbox", label: "الخزنة", icon: "account_balance_wallet", ability: "عرض الخزنة" },
  { href: "/ai-tenders", label: "مناقصات AI", icon: "request_quote", ability: "إدارة تكامل AI" },
  { href: "/ai-settings", label: "تكامل AI", icon: "smart_toy", ability: "إدارة تكامل AI" },
];
