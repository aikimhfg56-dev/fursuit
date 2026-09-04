import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import ContentPageLayout from "@/components/content/ContentPageLayout";

type LegalPageLayoutProps = {
  title: string;
  content: string;
  children?: ReactNode;
};

export default async function LegalPageLayout({ title, content, children }: LegalPageLayoutProps) {
  const t = await getTranslations("legal");

  return (
    <ContentPageLayout
      title={title}
      content={content}
      banner={
        <p className="mt-4 rounded border border-dashed border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
          {t("disclaimer")}
        </p>
      }
    >
      {children}
    </ContentPageLayout>
  );
}
