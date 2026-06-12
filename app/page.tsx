import { redirect } from "next/navigation";

/**
 * Root route ("/").
 *
 * The canonical landing page lives at "/landing" (rendered by
 * app/(components)/(landing-layout)/landing/page.tsx). This root entry simply
 * redirects there so there is a single source of truth for the landing UI,
 * avoiding the previously duplicated ~1250-line landing implementation that
 * had drifted out of sync (stale links, etc.).
 */
export default function RootPage() {
  redirect("/landing");
}
