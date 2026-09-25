"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type PreorderRequestFormProps = {
  productName: string;
  productSlug: string;
};

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export default function PreorderRequestForm({ productName, productSlug }: PreorderRequestFormProps) {
  const t = useTranslations("preorder.request");
  const tLegal = useTranslations("legal");
  const [status, setStatus] = useState<SubmitStatus>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    setStatus("submitting");

    try {
      const response = await fetch("/api/forms/preorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          productSlug,
          colorPreference: data.colorPreference,
          sizePreference: data.sizePreference,
          notes: data.notes,
          installmentPayment: data.installmentPayment === "on",
          agreedToTerms: data.agreedToTerms === "on",
        }),
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
      <p className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700">
        {t("success")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-black/10 p-6">
      <div>
        <h2 className="text-lg font-semibold">{t("heading")}</h2>
        <p className="mt-1 text-sm text-black/60">{t("description")}</p>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">{t("colorPreference")}</span>
        <input
          type="text"
          name="colorPreference"
          placeholder={t("colorPreferencePlaceholder")}
          required
          className="w-full rounded border border-black/15 bg-transparent px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">{t("sizePreference")}</span>
        <input
          type="text"
          name="sizePreference"
          placeholder={t("sizePreferencePlaceholder")}
          required
          className="w-full rounded border border-black/15 bg-transparent px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">{t("notes")}</span>
        <textarea
          name="notes"
          placeholder={t("notesPlaceholder")}
          rows={4}
          className="w-full rounded border border-black/15 bg-transparent px-3 py-2 text-sm"
        />
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="installmentPayment" className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{t("installmentPayment")}</span>
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
