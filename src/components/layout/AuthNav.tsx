import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function AuthNav() {
  const t = await getTranslations("account");

  return (
    <div className="flex items-center gap-3 text-sm">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button type="button" className="font-medium hover:underline">
            {t("signIn")}
          </button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <Link href="/account" className="font-medium hover:underline">
          {t("myAccount")}
        </Link>
        <UserButton />
      </Show>
    </div>
  );
}
