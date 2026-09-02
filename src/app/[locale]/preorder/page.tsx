import { useTranslations } from "next-intl";
import PagePlaceholder from "@/components/shared/PagePlaceholder";

export default function PreorderPage() {
  const t = useTranslations("preorder");
  const tc = useTranslations("common");

  return (
    <PagePlaceholder
      title={t("title")}
      description={t("description")}
      comingSoon={tc("comingSoon")}
    />
  );
}
