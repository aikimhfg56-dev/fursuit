import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing, type Locale } from "./i18n/routing";
import { isClerkConfigured } from "./lib/env";

const intlMiddleware = createIntlMiddleware(routing);

// Matches /<locale>/account and any sub-path, regardless of locale.
const isAccountRoute = createRouteMatcher(["/:locale/account(.*)"]);

function localeFromPathname(pathname: string): Locale {
  const segment = pathname.split("/")[1];
  return (routing.locales as readonly string[]).includes(segment)
    ? (segment as Locale)
    : routing.defaultLocale;
}

// Clerk's middleware throws without keys, so the whole site falls back to
// next-intl-only routing until NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY /
// CLERK_SECRET_KEY are set (see .env.local.example).
const proxy = isClerkConfigured()
  ? clerkMiddleware(async (auth, req) => {
      if (isAccountRoute(req)) {
        // Without this, auth.protect() sends unauthenticated visitors to
        // Clerk's own hosted accounts.dev sign-in instead of our localized page.
        const signInUrl = new URL(`/${localeFromPathname(req.nextUrl.pathname)}/sign-in`, req.url);
        await auth.protect({ unauthenticatedUrl: signInUrl.toString() });
      }
      return intlMiddleware(req);
    })
  : (req: NextRequest) => intlMiddleware(req);

export default proxy;

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
