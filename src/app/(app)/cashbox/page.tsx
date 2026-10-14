import { CashBoxView } from "@/components/cashbox/CashBoxView";
import { getCashBox, getCashBoxTransactions } from "@/lib/api/cashbox";
import { getCustodies } from "@/lib/api/custody";
import { getEmployees } from "@/lib/api/employees";
import { getProjects } from "@/lib/api/projects";
import { getSession } from "@/lib/session";

const PAGE_SIZE = 20;

export default async function CashBoxPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const tab = params.tab === "custody" ? "custody" : "transactions";
  const page = Number(params.page) || 1;
  const dateFrom = typeof params.dateFrom === "string" && params.dateFrom ? params.dateFrom : undefined;
  const dateTo = typeof params.dateTo === "string" && params.dateTo ? params.dateTo : undefined;
  const type = typeof params.type === "string" && params.type ? Number(params.type) : undefined;
  const isIn = params.isIn === "true" ? true : params.isIn === "false" ? false : undefined;
  const search = typeof params.search === "string" && params.search ? params.search : undefined;

  const filter = { page, pageSize: PAGE_SIZE, dateFrom, dateTo, type, isIn, search };

  const [cashbox, transactions, custodies, employees, projects, session] = await Promise.all([
    getCashBox(1),
    getCashBoxTransactions(filter),
    getCustodies(),
    getEmployees(),
    getProjects(),
    getSession(),
  ]);

  const canManage = session?.abilities.includes("إدارة المصاريف") ?? false;

  return (
    <CashBoxView
      totals={{ totalCash: cashbox.totalCash, totalCredit: cashbox.totalCredit, totalBalance: cashbox.totalBalance }}
      transactions={transactions}
      filter={filter}
      custodies={custodies}
      employees={employees}
      projects={projects}
      tab={tab}
      canManage={canManage}
    />
  );
}
