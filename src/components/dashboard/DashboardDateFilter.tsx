"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";

export function DashboardDateFilter({ from, to }: { from?: string; to?: string }) {
  const router = useRouter();
  const [fromDate, setFromDate] = useState(from ?? "");
  const [toDate, setToDate] = useState(to ?? "");

  function apply() {
    const params = new URLSearchParams();
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    router.push(params.toString() ? `/?${params.toString()}` : "/");
  }

  function clear() {
    setFromDate("");
    setToDate("");
    router.push("/");
  }

  return (
    <div className="flex items-end gap-stack-sm flex-wrap bg-surface-container-lowest rounded-xl border border-outline-variant p-stack-md">
      <FieldGroup label="من تاريخ">
        <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
      </FieldGroup>
      <FieldGroup label="إلى تاريخ">
        <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
      </FieldGroup>
      <Button size="sm" onClick={apply}>
        <Icon name="filter_alt" size={18} />
        تطبيق
      </Button>
      {(from || to) && (
        <Button size="sm" variant="secondary" onClick={clear}>
          مسح الفلتر
        </Button>
      )}
    </div>
  );
}
