import { useTranslations } from "next-intl";
import PagePlaceholder from "@/components/shared/PagePlaceholder";

export default function ShopPage() {
  const t = useTranslations("shop");
  const tc = useTranslations("common");

  return (
    <PagePlaceholder
      title={t("title")}
      description={t("description")}
      comingSoon={tc("comingSoon")}
    />
  );
}
