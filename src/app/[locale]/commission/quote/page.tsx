import { getTranslations } from "next-intl/server";
import InquiryForm from "@/components/forms/InquiryForm";

export default async function CommissionQuotePage() {
  const t = await getTranslations("commission.quote");

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-black/70 dark:text-white/70">{t("description")}</p>
      <div className="mt-8">
        <InquiryForm variant="commission" />
      </div>
    </div>
  );
}
