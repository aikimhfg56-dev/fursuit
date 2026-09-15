"use client";

import { useCallback, useSyncExternalStore, type ReactNode } from "react";

type ResponsiveOnlyProps = { query: string; children: ReactNode };

/**
 * Mounts `children` only while `query` matches — unlike a CSS `hidden` class,
 * this actually unmounts them on the other side. Needed for singleton
 * client widgets like Clerk's <UserButton/>, which errors
 * (cannot_render_single_session_enabled) if two instances are ever mounted
 * in the DOM at once, even if one is CSS-hidden.
 */
export default function ResponsiveOnly({ query, children }: ResponsiveOnlyProps) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", onChange);
      return () => mediaQueryList.removeEventListener("change", onChange);
    },
    [query],
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  // False on the server (and until hydration) matches having no window to query yet.
  const getServerSnapshot = useCallback(() => false, []);

  const matches = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return matches ? <>{children}</> : null;
}
