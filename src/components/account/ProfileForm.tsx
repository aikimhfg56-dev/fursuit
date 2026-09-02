"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { COUNTRIES } from "@/lib/account/countries";
import type { AccountAddress } from "@/lib/account/profile";

type ProfileFormProps = {
  initialDateOfBirth?: string;
  initialAddress?: AccountAddress;
};

const inputClass =
  "w-full rounded border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20";

export default function ProfileForm({ initialDateOfBirth, initialAddress }: ProfileFormProps) {
  const t = useTranslations("account.profileForm");
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const formData = new FormData(event.currentTarget);
    const payload = {
      dateOfBirth: formData.get("dateOfBirth"),
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
      router.push("/account");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block font-medium">{t("dateOfBirth")}</span>
        <input
          type="date"
          name="dateOfBirth"
          defaultValue={initialDateOfBirth}
          required
          className={inputClass}
        />
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

      {status === "error" && <p className="text-sm text-red-600 dark:text-red-400">{t("error")}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-black px-6 py-3 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-black"
      >
        {status === "submitting" ? t("saving") : t("save")}
      </button>
    </form>
  );
}
