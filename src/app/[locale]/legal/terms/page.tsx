import { getTranslations } from "next-intl/server";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export default async function TermsOfServicePage() {
  const t = await getTranslations("legal.terms");

  return <LegalPageLayout title={t("title")} content={t("content")} />;
}
