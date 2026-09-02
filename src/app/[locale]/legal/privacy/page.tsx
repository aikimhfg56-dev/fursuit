import { getTranslations } from "next-intl/server";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export default async function PrivacyPolicyPage() {
  const t = await getTranslations("legal.privacy");

  return <LegalPageLayout title={t("title")} content={t("content")} />;
}
