import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AccountOverview from "@/components/account/AccountOverview";
import AuthNotConfigured from "@/components/account/AuthNotConfigured";
import { isClerkConfigured } from "@/lib/env";
import { getAccountProfile } from "@/lib/account/profile";
import { fetchOrdersByEmail } from "@/lib/sanity/queries";

export default async function AccountPage() {
  if (!isClerkConfigured()) return <AuthNotConfigured />;

  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const profile = getAccountProfile(user);
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const username = user.username ?? email;
  const orders = email ? await fetchOrdersByEmail(email) : [];

  return (
    <AccountOverview
      username={username}
      email={email}
      fullName={profile.fullName}
      address={profile.address}
      orders={orders}
    />
  );
}
