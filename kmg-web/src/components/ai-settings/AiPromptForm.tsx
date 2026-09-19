"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { updateAiPrompt } from "@/actions/aiContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { FieldGroup, Textarea } from "@/components/ui/Field";
import { aiPromptSchema, type AiPromptFormValues } from "@/schema/aiContext";
import { formatDate } from "@/lib/utils";
import type { AiPromptDTO } from "@/types/aiContext";

export function AiPromptForm({ prompt }: { prompt: AiPromptDTO }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AiPromptFormValues>({
    resolver: zodResolver(aiPromptSchema),
    defaultValues: { promptText: prompt.promptText },
  });

  const onSubmit = async (data: AiPromptFormValues) => {
    setLoading(true);
    setServerError(null);
    setSaved(false);

    const result = await updateAiPrompt({ promptText: data.promptText });

    setLoading(false);
    if (!result.success) {
      setServerError(result.message ?? "حدث خطأ");
      return;
    }
    setSaved(true);
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>البرومبت الديناميكي</CardTitle>
        {prompt.updatedAt && (
          <span className="text-body-sm text-on-surface-variant">
            آخر تحديث: {formatDate(prompt.updatedAt)}
            {prompt.updatedByEmployeeName ? ` بواسطة ${prompt.updatedByEmployeeName}` : ""}
          </span>
        )}
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label="وجّه الموديل لاهتمامات الفترة الحالية" error={errors.promptText?.message}>
          <Textarea
            rows={6}
            placeholder="مثال: ركّز الفترة دي على مناقصات الكلادينج والواجهات المعدنية في القاهرة الكبرى"
            {...register("promptText")}
          />
        </FieldGroup>

        {serverError && (
          <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>
        )}
        {saved && !serverError && (
          <div className="rounded bg-surface-container-high text-on-surface text-body-sm px-stack-md py-2">تم الحفظ بنجاح</div>
        )}

        <div>
          <Button type="submit" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
