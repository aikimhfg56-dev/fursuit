import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import ProfileForm from "@/components/account/ProfileForm";
import AuthNotConfigured from "@/components/account/AuthNotConfigured";
import { isClerkConfigured } from "@/lib/env";
import { getAccountProfile, isProfileComplete } from "@/lib/account/profile";

export default async function CompleteProfilePage() {
  if (!isClerkConfigured()) return <AuthNotConfigured />;

  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const profile = getAccountProfile(user);
  if (isProfileComplete(profile)) redirect("/account");

  const t = await getTranslations("account.completeProfile");

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-black/70 dark:text-white/70">{t("description")}</p>
      <div className="mt-8">
        <ProfileForm initialDateOfBirth={profile.dateOfBirth} initialAddress={profile.address} />
      </div>
    </div>
  );
}
