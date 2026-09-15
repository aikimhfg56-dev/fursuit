"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  MAX_REFERENCE_FILES,
  MAX_REFERENCE_FILE_SIZE_BYTES,
  MAX_REFERENCE_TOTAL_SIZE_BYTES,
  REFERENCE_FILE_ACCEPT,
} from "@/lib/forms/referenceFiles";

type InquiryFormProps = {
  variant: "commission" | "contact";
};

type OrderType = "fullSuit" | "partialSuit" | "parts";
type SubmitStatus = "idle" | "submitting" | "success" | "redirecting" | "error" | "files_too_large";

const FORM_ENDPOINTS: Record<InquiryFormProps["variant"], string> = {
  commission: "/api/forms/quote",
  contact: "/api/forms/contact",
};

const TRANSLATION_NAMESPACES: Record<InquiryFormProps["variant"], string> = {
  commission: "commission.quote.form",
  contact: "contact.form",
};

const ORDER_TYPES: OrderType[] = ["fullSuit", "partialSuit", "parts"];

const PART_TYPE_VALUES = [
  "head",
  "handpaws",
  "puffyHandpaws",
  "feetpawsOutdoorPlantigrade",
  "feetpawsOutdoorDigitigrade",
  "sockpawsIndoorPlantigrade",
  "tail",
  "armsleeves",
  "body",
] as const;

export default function InquiryForm({ variant }: InquiryFormProps) {
  const t = useTranslations(TRANSLATION_NAMESPACES[variant]);
  const tLegal = useTranslations("legal");
  const router = useRouter();
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [orderType, setOrderType] = useState<OrderType>("fullSuit");
  const usesFileUpload = variant === "commission";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (usesFileUpload) {
      const files = new FormData(form).getAll("referenceFiles").filter((value): value is File => value instanceof File && value.size > 0);
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);

      if (
        files.length > MAX_REFERENCE_FILES ||
        files.some((file) => file.size > MAX_REFERENCE_FILE_SIZE_BYTES) ||
        totalSize > MAX_REFERENCE_TOTAL_SIZE_BYTES
      ) {
        setStatus("files_too_large");
        return;
      }
    }

    setStatus("submitting");

    try {
      const response = usesFileUpload
        ? await fetch(FORM_ENDPOINTS[variant], { method: "POST", body: new FormData(form) })
        : await fetch(FORM_ENDPOINTS[variant], {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
          });

      if (!response.ok) throw new Error("request_failed");
      const data = await response.json();

      // Only the contact form has no account behind it — jump straight into
      // the token-gated chat thread we just created rather than showing a
      // static "we'll be in touch" message, since this IS how we'll be in touch.
      if (variant === "contact" && data.threadId && data.token) {
        setStatus("redirecting");
        router.push(`/messages/${data.threadId}?token=${data.token}`);
        return;
      }

      setStatus("success");
      form.reset();
      setOrderType("fullSuit");
    } catch {
      setStatus("error");
    }
  }

  if (status === "redirecting") {
    return (
      <p className="rounded border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700">
        {t("redirecting")}
      </p>
    );
  }

  if (status === "success") {
    return (
      <p className="rounded border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700">
        {t("success")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {variant === "commission" && (
        <>
          <fieldset>
            <legend className="mb-1 block text-sm font-medium">{t("orderType")}</legend>
            <div className="flex flex-wrap gap-4">
              {ORDER_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="orderType"
                    value={type}
                    checked={orderType === type}
                    onChange={() => setOrderType(type)}
                    className="h-4 w-4"
                  />
                  {t(`orderTypeOptions.${type}`)}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="rushOrder" className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{t("rushOrder")}</span>
          </label>

          {orderType === "parts" && (
            <>
              <fieldset>
                <legend className="mb-1 block text-sm font-medium">{t("partType")}</legend>
                <div className="grid grid-cols-2 gap-2">
                  {PART_TYPE_VALUES.map((value) => (
                    <label key={value} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="partTypes" value={value} className="h-4 w-4" />
                      {t(`partTypeOptions.${value}`)}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Field label={t("species")} name="species" placeholder={t("speciesPlaceholder")} />
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label={t("twitterId")} name="twitterId" placeholder={t("twitterIdPlaceholder")} />
            <Field label={t("instagramId")} name="instagramId" placeholder={t("instagramIdPlaceholder")} />
          </div>
          <TextArea
            label={t("designNotes")}
            name="designNotes"
            placeholder={t("designNotesPlaceholder")}
            required
          />
          <label className="block text-sm">
            <span className="mb-1 block font-medium">{t("referenceFiles")}</span>
            <input
              type="file"
              name="referenceFiles"
              multiple
              accept={REFERENCE_FILE_ACCEPT}
              className="w-full rounded border border-black/15 bg-transparent px-3 py-2 text-sm"
            />
            <span className="mt-1 block text-xs text-black/50">{t("referenceFilesHint")}</span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="agreedToTerms" required className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {tLegal.rich("termsAgreementLabel", {
                termsLink: (chunks) => (
                  <Link href="/legal/terms" target="_blank" className="underline">
                    {chunks}
                  </Link>
                ),
              })}
            </span>
          </label>
        </>
      )}

      {variant === "contact" && (
        <>
          <Field label={t("name")} name="name" required />
          <Field label={t("email")} name="email" type="email" required />
          <Field label={t("subject")} name="subject" required />
          <TextArea label={t("message")} name="message" required />
        </>
      )}

      {status === "files_too_large" && (
        <p className="text-sm text-red-600">{t("filesTooLarge")}</p>
      )}
      {status === "error" && <p className="text-sm text-red-600">{t("error")}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-black px-6 py-3 text-sm font-medium text-white disabled:opacity-40"
      >
        {status === "submitting" ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}

type FieldProps = {
  label: ReactNode;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
};

function Field({ label, name, type = "text", required, placeholder }: FieldProps) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded border border-black/15 bg-transparent px-3 py-2 text-sm"
      />
    </label>
  );
}

function TextArea({ label, name, required, placeholder }: FieldProps) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <textarea
        name={name}
        required={required}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded border border-black/15 bg-transparent px-3 py-2 text-sm"
      />
    </label>
  );
}

