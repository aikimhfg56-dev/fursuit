"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  MAX_REFERENCE_FILES,
  MAX_REFERENCE_FILE_SIZE_BYTES,
  MAX_REFERENCE_TOTAL_SIZE_BYTES,
  REFERENCE_FILE_ACCEPT,
} from "@/lib/forms/referenceFiles";

type InquiryFormProps = {
  variant: "commission" | "contact";
};

type SubmitStatus = "idle" | "submitting" | "success" | "error" | "files_too_large";

export default function InquiryForm({ variant }: InquiryFormProps) {
  const t = useTranslations(variant === "commission" ? "commission.quote.form" : "contact.form");
  const [status, setStatus] = useState<SubmitStatus>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (variant === "commission") {
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
      const response =
        variant === "commission"
          ? await fetch("/api/forms/quote", { method: "POST", body: new FormData(form) })
          : await fetch("/api/forms/contact", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
            });

      if (!response.ok) throw new Error("request_failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="rounded border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
        {t("success")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {variant === "commission" ? (
        <>
          <div className="flex gap-6">
            <Checkbox label={t("hasHorns")} name="hasHorns" />
            <Checkbox label={t("hasTail")} name="hasTail" />
          </div>
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
              className="w-full rounded border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
            />
            <span className="mt-1 block text-xs text-black/50 dark:text-white/50">{t("referenceFilesHint")}</span>
          </label>
        </>
      ) : (
        <>
          <Field label={t("name")} name="name" required />
          <Field label={t("email")} name="email" type="email" required />
          <Field label={t("subject")} name="subject" required />
          <TextArea label={t("message")} name="message" required />
        </>
      )}

      {status === "files_too_large" && (
        <p className="text-sm text-red-600 dark:text-red-400">{t("filesTooLarge")}</p>
      )}
      {status === "error" && <p className="text-sm text-red-600 dark:text-red-400">{t("error")}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-black px-6 py-3 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-black"
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
        className="w-full rounded border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
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
        className="w-full rounded border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
      />
    </label>
  );
}

function Checkbox({ label, name }: { label: ReactNode; name: string }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} className="h-4 w-4" />
      {label}
    </label>
  );
}
