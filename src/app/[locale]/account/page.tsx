import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AccountOverview from "@/components/account/AccountOverview";
import AuthNotConfigured from "@/components/account/AuthNotConfigured";
import { isClerkConfigured } from "@/lib/env";
import { getAccountProfile, isProfileComplete } from "@/lib/account/profile";
import { fetchOrdersByEmail } from "@/lib/sanity/queries";

export default async function AccountPage() {
  if (!isClerkConfigured()) return <AuthNotConfigured />;

  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const profile = getAccountProfile(user);
  if (!isProfileComplete(profile)) redirect("/account/complete-profile");

  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || email;
  const orders = email ? await fetchOrdersByEmail(email) : [];

  return (
    <AccountOverview
      name={name}
      email={email}
      dateOfBirth={profile.dateOfBirth}
      address={profile.address}
      orders={orders}
    />
  );
}
