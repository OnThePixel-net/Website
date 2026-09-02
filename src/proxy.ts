import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/i18n/translations";

const LOCALE_COOKIE = "otp.locale";
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Marks a request as the product of this file's own rewrite.
 *
 * Next runs the proxy again on a rewrite target, so "/about/" → "/en/about/"
 * comes straight back in carrying an /en prefix — indistinguishable from a
 * visitor typing "/en/about/" unless we leave a note. Without this marker the
 * canonical-spelling redirect below fires on our own rewrite and sends the
 * request back to "/about/", which rewrites again: every English URL turns
 * into an endless 308 loop, while German — never rewritten — keeps working.
 */
const INTERNAL_REWRITE_HEADER = "x-otp-rewritten";

/**
 * Decide whether a request has to be redirected to its trailing-slash form.
 *
 * `trailingSlash: true` makes Next serve every page at "/path/", but
 * `skipTrailingSlashRedirect: true` (needed so the OIDC callback keeps its
 * exact URL, see next.config.mjs) also disables the 308 that would send
 * "/path" there. Both spellings would answer 200 — duplicate content with
 * two competing URLs per page. So we issue that redirect ourselves, for
 * pages only:
 *
 * - "/" and anything already ending in "/" is final,
 * - /api/* is left completely untouched (the matcher below excludes it; the
 *   check here keeps the rule true even if the matcher is ever widened),
 * - a dot in the last segment marks a file (/sitemap.xml, /llms.txt,
 *   /robots.txt) which is served as-is and must not gain a slash.
 */
function needsTrailingSlash(pathname: string): boolean {
  if (pathname === "/" || pathname.endsWith("/")) return false;
  if (pathname === "/api" || pathname.startsWith("/api/")) return false;
  const lastSegment = pathname.slice(pathname.lastIndexOf("/") + 1);
  return !lastSegment.includes(".");
}

/**
 * Route handlers have no layout and therefore no language, so they live
 * outside the app/[locale] segment and must never be rewritten into it.
 *
 * /api/* is already kept out by the matcher. Two of them, though, sit inside
 * folders that otherwise hold pages — /apply/api/<position>/ and /redeem/api/
 * — so they do reach this file, and rewriting them would point at a route
 * that does not exist. They are recognised by an "api" path segment, which no
 * page has (/api-docs/ is one segment and does not match).
 */
function isRouteHandler(pathname: string): boolean {
  return (
    pathname === "/api" ||
    pathname.startsWith("/api/") ||
    pathname.includes("/api/")
  );
}

/**
 * Build a redirect/rewrite target from the request URL.
 *
 * Deliberately a plain `URL` and not `req.nextUrl.clone()`. NextURL captures
 * whether the *incoming* path had a trailing slash and re-applies that when
 * the object is stringified, so assigning a pathname of "/about/" to a clone
 * of "/about" yields "/about" again — the trailing-slash redirect below would
 * point at itself and loop forever. A plain URL keeps what it is given.
 */
function withPathname(req: NextRequest, pathname: string): URL {
  const url = new URL(req.url);
  url.pathname = pathname;
  return url;
}

/**
 * Maps the public URL space onto the app/[locale] route tree.
 *
 * Pages live at /[locale]/..., but the URLs stay exactly as they are indexed
 * today: English at the root, German behind /de/.
 *
 *   /about/     → rewritten to /en/about/   (address bar keeps /about/)
 *   /de/about/  → matches the route directly, nothing to do
 *   /en/about/  → 308 to /about/            (one canonical spelling per page)
 *
 * That rewrite is what lets the locale be a route segment instead of a cookie
 * read during render, which is what makes these pages prerenderable at all.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Canonicalise first, so /de/about → 308 → /de/about/ → matched route.
  // The target always ends in "/", so a redirect can never loop.
  if (needsTrailingSlash(pathname)) {
    return NextResponse.redirect(withPathname(req, `${pathname}/`), 308);
  }

  if (isRouteHandler(pathname)) return NextResponse.next();

  const segments = pathname.split("/");
  const first = segments[1];

  // The default locale lives at the root, so "/en/about/" is a second URL for
  // a page that is canonically "/about/". Rewriting it would answer 200 and
  // split the page across two spellings, so it is redirected away instead.
  // The cookie is still set: someone arriving on an /en/ link is asking for
  // English, and the redirect target carries no locale of its own. Nothing
  // reads that cookie while rendering — the URL alone decides the language —
  // it is only a record of the visitor's choice, the same one the language
  // switcher writes in the browser.
  // ...unless we put it there ourselves a moment ago, in which case this is
  // the internal route path and must be served, not redirected.
  if (
    first === DEFAULT_LOCALE &&
    req.headers.get(INTERNAL_REWRITE_HEADER) === null
  ) {
    const url = withPathname(req, "/" + segments.slice(2).join("/"));
    const res = NextResponse.redirect(url, 308);
    res.cookies.set(LOCALE_COOKIE, DEFAULT_LOCALE, {
      path: "/",
      maxAge: ONE_YEAR,
      sameSite: "lax",
    });
    return res;
  }

  // Every other supported locale is already spelled the way its route is:
  // /de/about/ *is* the [locale]=de route. Nothing to rewrite — and nothing
  // to add to the response either, since a Set-Cookie here would make an
  // otherwise fully cacheable prerendered page uncacheable at the CDN.
  if ((SUPPORTED_LOCALES as readonly string[]).includes(first)) {
    return NextResponse.next();
  }

  // No locale prefix, so this is the default locale under its bare URL. The
  // segment is added internally; the address bar keeps showing /about/.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(INTERNAL_REWRITE_HEADER, "1");
  return NextResponse.rewrite(
    withPathname(req, `/${DEFAULT_LOCALE}${pathname}`),
    { request: { headers: requestHeaders } },
  );
}

export const config = {
  // "api/" (not "api") so that real pages whose name merely starts with those
  // three letters — /apply, /apply/builder — are still canonicalised, while
  // every actual API route stays untouched.
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
