import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { isClerkConfigured } from "./lib/env";

const intlMiddleware = createIntlMiddleware(routing);

// Matches /<locale>/account and any sub-path, regardless of locale.
const isAccountRoute = createRouteMatcher(["/:locale/account(.*)"]);

// Clerk's middleware throws without keys, so the whole site falls back to
// next-intl-only routing until NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY /
// CLERK_SECRET_KEY are set (see .env.local.example).
const proxy = isClerkConfigured()
  ? clerkMiddleware(async (auth, req) => {
      if (isAccountRoute(req)) {
        await auth.protect();
      }
      return intlMiddleware(req);
    })
  : (req: NextRequest) => intlMiddleware(req);

export default proxy;

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
