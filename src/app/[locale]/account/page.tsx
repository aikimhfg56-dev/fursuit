import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AccountOverview from "@/components/account/AccountOverview";
import AuthNotConfigured from "@/components/account/AuthNotConfigured";
import { isClerkConfigured } from "@/lib/env";
import { getAccountProfile } from "@/lib/account/profile";
import { isThreadUnread, listThreadsForBuyer } from "@/lib/messages/store";
import { listOrdersForBuyer } from "@/lib/orders/store";

export default async function AccountPage() {
  if (!isClerkConfigured()) return <AuthNotConfigured />;

  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const profile = getAccountProfile(user);
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const username = user.username ?? email;
  const orders = await listOrdersForBuyer(user.id);
  const threads = await listThreadsForBuyer(user.id);
  const unreadMessagesCount = threads.filter((thread) => isThreadUnread(thread, "buyer")).length;

  return (
    <AccountOverview
      username={username}
      email={email}
      fullName={profile.fullName}
      address={profile.address}
      orders={orders}
      unreadMessagesCount={unreadMessagesCount}
    />
  );
}
