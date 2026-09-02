"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";

type InquiryFormProps = {
  variant: "commission" | "contact";
};

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export default function InquiryForm({ variant }: InquiryFormProps) {
  const t = useTranslations(variant === "commission" ? "commission.quote.form" : "contact.form");
  const [status, setStatus] = useState<SubmitStatus>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("submitting");

    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch(variant === "commission" ? "/api/forms/quote" : "/api/forms/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      <Field label={t("name")} name="name" required />
      <Field label={t("email")} name="email" type="email" required />

      {variant === "commission" ? (
        <>
          <Field label={t("country")} name="country" />
          <TextArea
            label={t("characterDescription")}
            name="characterDescription"
            placeholder={t("characterDescriptionPlaceholder")}
            required
          />
          <Field
            label={t("referenceLinks")}
            name="referenceLinks"
            placeholder={t("referenceLinksPlaceholder")}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("budget")} name="budget" />
            <Field label={t("timeline")} name="timeline" />
          </div>
        </>
      ) : (
        <>
          <Field label={t("subject")} name="subject" required />
          <TextArea label={t("message")} name="message" required />
        </>
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
