import { SignIn } from "@clerk/nextjs";
import AuthNotConfigured from "@/components/account/AuthNotConfigured";
import { isClerkConfigured } from "@/lib/env";

export default function SignInPage() {
  if (!isClerkConfigured()) return <AuthNotConfigured />;

  return (
    <div className="flex justify-center px-6 py-16">
      <SignIn />
    </div>
  );
}
