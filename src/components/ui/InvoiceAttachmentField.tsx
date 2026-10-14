"use client";

import { useRef, useState } from "react";
import { uploadAttachmentFile } from "@/actions/files";
import { FieldGroup } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";

export interface InvoiceAttachmentValue {
  attachmentUrl: string;
  attachmentFileName: string;
}

interface Props {
  folder?: string;
  value: InvoiceAttachmentValue | null;
  onChange: (value: InvoiceAttachmentValue | null) => void;
  label?: string;
}

/**
 * حقل رفع مرفق (فاتورة/إيصال) قابل لإعادة الاستخدام في أي فورم مالي - بيرفع الملف فورًا
 * لحظة الاختيار ويخزّن رابطه في state الأب، بدل ما يبقى جزء من react-hook-form.
 */
export function InvoiceAttachmentField({ folder = "invoices", value, onChange, label = "مرفق الفاتورة/الإيصال (اختياري)" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadAttachmentFile(folder, formData);
    setUploading(false);

    if (!result.success || !result.data) {
      setError(result.message ?? "فشل رفع الملف");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    onChange({ attachmentUrl: result.data.fileUrl, attachmentFileName: result.data.fileName });
  }

  function handleRemove() {
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <FieldGroup label={label} error={error ?? undefined}>
      {value ? (
        <div className="flex items-center gap-stack-sm rounded border border-outline-variant bg-surface-container-lowest p-stack-md">
          <Icon name="description" className="text-primary shrink-0" />
          <a href={value.attachmentUrl} target="_blank" rel="noreferrer" className="text-body-sm text-on-surface truncate flex-1 hover:underline">
            {value.attachmentFileName}
          </a>
          <button type="button" onClick={handleRemove} className="text-error hover:opacity-80 shrink-0" title="إزالة المرفق">
            <Icon name="close" size={18} />
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-2 rounded border border-dashed border-outline-variant bg-surface-container-lowest p-stack-md cursor-pointer hover:border-primary transition-colors">
          <Icon name={uploading ? "hourglass_top" : "upload_file"} size={20} className="text-on-surface-variant" />
          <span className="text-body-sm text-on-surface-variant">{uploading ? "جاري الرفع..." : "اضغط لرفع مرفق (بحد أقصى 20 ميجا)"}</span>
          <input ref={fileInputRef} type="file" className="hidden" disabled={uploading} onChange={handleFileChange} />
        </label>
      )}
    </FieldGroup>
  );
}
