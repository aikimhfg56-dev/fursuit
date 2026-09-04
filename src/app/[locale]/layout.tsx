import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Geist_Mono, Red_Hat_Text } from "next/font/google";
import { routing } from "@/i18n/routing";
import { isClerkConfigured } from "@/lib/env";
import { getSiteUrl } from "@/lib/seo/site";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "../globals.css";

const SITE_NAME = "Fursuit Studio";
const SITE_DESCRIPTION =
  "Handcrafted fursuits, made to order and ready to ship, for fursuiters around the world.";

const redHatText = Red_Hat_Text({
  variable: "--font-red-hat-text",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const body = (
    <NextIntlClientProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </NextIntlClientProvider>
  );

  return (
    <html
      lang={locale}
      className={`${redHatText.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {isClerkConfigured() ? (
          <ClerkProvider signInUrl={`/${locale}/sign-in`} signUpUrl={`/${locale}/sign-up`} afterSignOutUrl={`/${locale}`}>
            {body}
          </ClerkProvider>
        ) : (
          body
        )}
      </body>
    </html>
  );
}
