import Footer from "@/components/page/footer";
import { SiteHeader } from "@/components/page/site-header";
import { getRouteLocale, type LocalePageProps } from "@/lib/i18n/server";

/**
 * The chrome of the public site: the sticky header, the `<main>` wrapper and
 * the footer. It used to sit in the root layout, which meant the admin
 * dashboard was served with a public navigation bar stacked on top of its own
 * sidebar.
 *
 * `(site)` is a route group, so this folder contributes nothing to any URL —
 * "/about/" is still "/about/". Moving the pages in here and the dashboard
 * into `(dashboard)` is what lets the two get different chrome without the
 * root layout having to know which path is being rendered; asking for the
 * path would mean `headers()`, and that would opt every page on the site out
 * of static prerendering.
 *
 * `params` is the same one the root layout gets — `[locale]` is the segment
 * above this group — so the footer keeps being a server component rendered
 * for the locale of the route, with no request access of any kind.
 */
export default async function SiteLayout({
  children,
  params,
}: LocalePageProps & {
  children: React.ReactNode;
}) {
  const locale = await getRouteLocale(params);

  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <Footer locale={locale} />
    </>
  );
}
