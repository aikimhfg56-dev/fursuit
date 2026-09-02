import { useTranslations } from "next-intl";
import PagePlaceholder from "@/components/shared/PagePlaceholder";

export default function ContactPage() {
  const t = useTranslations("contact");
  const tc = useTranslations("common");

  return (
    <PagePlaceholder
      title={t("title")}
      description={t("description")}
      comingSoon={tc("comingSoon")}
    />
  );
}
