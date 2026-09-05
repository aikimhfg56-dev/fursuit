import { getTranslations } from "next-intl/server";

export default async function AuthNotConfigured() {
  const t = await getTranslations("account");

  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <p className="rounded border border-dashed border-black/20 px-4 py-3 text-sm text-black/60">
        {t("notConfigured")}
      </p>
    </div>
  );
}
