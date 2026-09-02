import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import { isClerkConfigured } from "@/lib/env";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fursuit Studio",
  description: "Handcrafted fursuits, made to order and ready to ship, for fursuiters around the world.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
