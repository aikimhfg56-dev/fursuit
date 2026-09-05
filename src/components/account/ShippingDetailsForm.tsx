"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { COUNTRIES } from "@/lib/account/countries";
import type { AccountAddress } from "@/lib/account/profile";

type ShippingDetailsFormProps = {
  initialFullName?: string;
  initialAddress?: AccountAddress;
  /** Defaults to router.refresh() — pass a custom handler if the caller needs different post-save behavior. */
  onSaved?: () => void;
};

const inputClass =
  "w-full rounded border border-black/15 bg-transparent px-3 py-2 text-sm";

export default function ShippingDetailsForm({
  initialFullName,
  initialAddress,
  onSaved,
}: ShippingDetailsFormProps) {
  const t = useTranslations("account.shippingForm");
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const formData = new FormData(event.currentTarget);
    const payload = {
      fullName: formData.get("fullName"),
      address: {
        line1: formData.get("line1"),
        line2: formData.get("line2"),
        city: formData.get("city"),
        postalCode: formData.get("postalCode"),
        country: formData.get("country"),
      },
    };

    try {
      const response = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("request_failed");

      if (onSaved) {
        onSaved();
      } else {
        router.refresh();
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block font-medium">{t("fullName")}</span>
        <input type="text" name="fullName" defaultValue={initialFullName} required className={inputClass} />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">{t("addressLine1")}</span>
        <input type="text" name="line1" defaultValue={initialAddress?.line1} required className={inputClass} />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">{t("addressLine2")}</span>
        <input type="text" name="line2" defaultValue={initialAddress?.line2} className={inputClass} />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">{t("city")}</span>
          <input type="text" name="city" defaultValue={initialAddress?.city} required className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">{t("postalCode")}</span>
          <input
            type="text"
            name="postalCode"
            defaultValue={initialAddress?.postalCode}
            required
            className={inputClass}
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">{t("country")}</span>
        <select name="country" defaultValue={initialAddress?.country ?? ""} required className={inputClass}>
          <option value="" disabled>
            {t("countryPlaceholder")}
          </option>
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </label>

      {status === "error" && <p className="text-sm text-red-600">{t("error")}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-black px-6 py-3 text-sm font-medium text-white disabled:opacity-40"
      >
        {status === "submitting" ? t("saving") : t("save")}
      </button>
    </form>
  );
}
