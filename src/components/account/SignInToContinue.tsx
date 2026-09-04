import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

type SignInToContinueProps = {
  /** Locale-agnostic path to return to after sign-in, e.g. "/shop/sample-fox-fullsuit". */
  returnPath: string;
  description: string;
};

export default async function SignInToContinue({ returnPath, description }: SignInToContinueProps) {
  const t = await getTranslations("account");
  const locale = (await getLocale()) as Locale;
  const signInHref = `/${locale}/sign-in?redirect_url=${encodeURIComponent(`/${locale}${returnPath}`)}`;

  return (
    <div className="rounded-xl border border-black/10 p-6 text-center dark:border-white/10">
      <p className="text-sm text-black/70 dark:text-white/70">{description}</p>
      <Link
        href={signInHref}
        className="mt-4 inline-block rounded-full bg-black px-6 py-3 text-sm font-medium text-white dark:bg-white dark:text-black"
      >
        {t("signIn")}
      </Link>
    </div>
  );
}
