import type { ReactNode } from "react";
import ContentPageLayout from "@/components/content/ContentPageLayout";

type LegalPageLayoutProps = {
  title: string;
  content: string;
  children?: ReactNode;
};

export default function LegalPageLayout({ title, content, children }: LegalPageLayoutProps) {
  return (
    <ContentPageLayout title={title} content={content}>
      {children}
    </ContentPageLayout>
  );
}
