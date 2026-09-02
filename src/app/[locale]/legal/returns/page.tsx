import { getTranslations } from "next-intl/server";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export default async function ReturnsPolicyPage() {
  const t = await getTranslations("legal.returns");

  return <LegalPageLayout title={t("title")} content={t("content")} />;
}
