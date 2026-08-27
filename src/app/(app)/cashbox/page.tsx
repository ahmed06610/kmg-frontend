import { CashBoxView } from "@/components/cashbox/CashBoxView";
import { getCashBox } from "@/lib/api/cashbox";

export default async function CashBoxPage() {
  const cashbox = await getCashBox(100);
  return <CashBoxView cashbox={cashbox} />;
}
