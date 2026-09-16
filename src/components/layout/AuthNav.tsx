import { currentUser } from "@clerk/nextjs/server";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { isClerkConfigured } from "@/lib/env";
import { listThreadsForBuyer } from "@/lib/messages/store";

export default async function AuthNav() {
  const t = await getTranslations("account");

  // Shown on "My Account" whenever a real order (Shop/Semi Order/Custom
  // Commission — not a plain Contact inquiry) hasn't been marked shipped yet.
  const user = isClerkConfigured() ? await currentUser() : null;
  const hasActiveOrder = user
    ? (await listThreadsForBuyer(user.id)).some((thread) => thread.kind !== "contact" && !thread.trackingNumber)
    : false;

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
        <Link href="/account" className="relative font-medium hover:underline">
          {t("myAccount")}
          {hasActiveOrder && (
            <span
              className="absolute -right-2.5 -top-1.5 flex h-2.5 w-2.5 rounded-full bg-accent"
              role="img"
              aria-label={t("activeOrderBadge")}
              title={t("activeOrderBadge")}
            />
          )}
        </Link>
        <UserButton />
      </Show>
    </div>
  );
}
