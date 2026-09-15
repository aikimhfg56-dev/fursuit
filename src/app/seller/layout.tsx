import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "出品者管理画面",
  // Kept out of search engines — this area isn't meant for shoppers.
  robots: { index: false, follow: false },
};

type SellerRootLayoutProps = {
  children: React.ReactNode;
};

/**
 * Independent root layout for /seller — lives outside the [locale] tree so it
 * has no next-intl routing, no Clerk (buyer auth is unrelated here), and
 * never appears in the storefront's nav or sitemap.
 */
export default function SellerRootLayout({ children }: SellerRootLayoutProps) {
  return (
    <html lang="ja">
      <body className="min-h-full bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
