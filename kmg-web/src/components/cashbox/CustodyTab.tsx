"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteCustody } from "@/actions/custody";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { EmployeeListDTO } from "@/types/employee";
import type { CustodyDTO } from "@/types/custody";
import type { ProjectListDTO } from "@/types/project";
import { CustodyDialog } from "./CustodyDialog";
import { SettleCustodyDialog } from "./SettleCustodyDialog";

export function CustodyTab({
  custodies,
  employees,
  projects,
  canManage,
}: {
  custodies: CustodyDTO[];
  employees: EmployeeListDTO[];
  projects: ProjectListDTO[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingCustody, setEditingCustody] = useState<CustodyDTO | undefined>(undefined);
  const [settlingCustody, setSettlingCustody] = useState<CustodyDTO | null>(null);
  const [deletingCustody, setDeletingCustody] = useState<CustodyDTO | null>(null);

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="flex items-center justify-between flex-wrap gap-stack-sm">
        <p className="text-body-sm text-on-surface-variant">عهد جانبية بتتصرف لموظف مباشرة، مش مرتبطة بمأمورية معينة</p>
        {canManage && (
          <Button
            size="sm"
            onClick={() => {
              setEditingCustody(undefined);
              setCreateOpen(true);
            }}
          >
            <Icon name="add" size={18} />
            عهدة جديدة
          </Button>
        )}
      </div>

      {custodies.length === 0 ? (
        <EmptyState icon="wallet" title="لا توجد عهد جانبية مسجلة بعد" />
      ) : (
        <Table>
          <THead>
            <tr>
              <Th>الموظف</Th>
              <Th>الوصف</Th>
              <Th>القيمة</Th>
              <Th>كاش / كريديت</Th>
              <Th>المشروع</Th>
              <Th>تاريخ الصرف</Th>
              <Th>الحالة</Th>
              {canManage && <Th>إجراءات</Th>}
            </tr>
          </THead>
          <TBody>
            {custodies.map((c) => (
              <Tr key={c.id}>
                <Td>{c.employeeName}</Td>
                <Td>{c.description}</Td>
                <TdMono>{formatCurrency(c.amount)}</TdMono>
                <TdMono>
                  {formatCurrency(c.amountCash)} / {formatCurrency(c.amountCredit)}
                </TdMono>
                <Td>{c.projectName ?? "-"}</Td>
                <Td>{formatDate(c.issueDate)}</Td>
                <Td>
                  <Badge tone={c.status === "Settled" ? "success" : "warning"}>{c.status === "Settled" ? "متسواة" : "نشطة"}</Badge>
                </Td>
                {canManage && (
                  <Td>
                    <div className="flex items-center gap-2">
                      {c.status === "Active" && (
                        <button onClick={() => setSettlingCustody(c)} className="text-primary text-body-sm font-semibold hover:underline">
                          تسوية
                        </button>
                      )}
                      <button
                        className="text-on-surface-variant hover:text-on-surface"
                        title="تعديل"
                        onClick={() => {
                          setEditingCustody(c);
                          setCreateOpen(true);
                        }}
                      >
                        <Icon name="edit" size={18} />
                      </button>
                      <button className="text-error hover:opacity-80" title="حذف" onClick={() => setDeletingCustody(c)}>
                        <Icon name="delete" size={18} />
                      </button>
                    </div>
                  </Td>
                )}
              </Tr>
            ))}
          </TBody>
        </Table>
      )}

      <CustodyDialog
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setEditingCustody(undefined);
        }}
        employees={employees}
        projects={projects}
        custody={editingCustody}
      />
      <SettleCustodyDialog open={!!settlingCustody} onClose={() => setSettlingCustody(null)} custody={settlingCustody} />
      <ConfirmDialog
        open={!!deletingCustody}
        onClose={() => setDeletingCustody(null)}
        title="حذف العهدة الجانبية"
        message="هل أنت متأكد من حذف هذه العهدة؟ سيتم إلغاء أثرها في الخزنة."
        onConfirm={() => deleteCustody(deletingCustody!.id)}
        onConfirmed={() => router.refresh()}
      />
    </div>
  );
}
