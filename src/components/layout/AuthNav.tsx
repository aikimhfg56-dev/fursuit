"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function AuthNav() {
  const t = useTranslations("account");

  return (
    <div className="flex items-center gap-3 text-sm">
      <SignedOut>
        <SignInButton mode="modal">
          <button type="button" className="font-medium hover:underline">
            {t("signIn")}
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <Link href="/account" className="font-medium hover:underline">
          {t("myAccount")}
        </Link>
        <UserButton />
      </SignedIn>
    </div>
  );
}
