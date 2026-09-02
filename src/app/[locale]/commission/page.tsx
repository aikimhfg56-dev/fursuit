import { useTranslations } from "next-intl";
import PagePlaceholder from "@/components/shared/PagePlaceholder";

export default function CommissionPage() {
  const t = useTranslations("commission");
  const tc = useTranslations("common");

  return (
    <PagePlaceholder
      title={t("title")}
      description={t("description")}
      comingSoon={tc("comingSoon")}
    />
  );
}
