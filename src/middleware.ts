import { NextResponse, type NextRequest } from "next/server";
import { SUPPORTED_LOCALES } from "@/lib/i18n/translations";

const LOCALE_COOKIE = "otp.locale";
const LOCALE_HEADER = "x-otp-locale";
const ONE_YEAR = 60 * 60 * 24 * 365;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const segments = pathname.split("/");
  const first = segments[1];

  if ((SUPPORTED_LOCALES as readonly string[]).includes(first)) {
    const url = req.nextUrl.clone();
    const rest = segments.slice(2).join("/");
    url.pathname = "/" + rest;
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set(LOCALE_HEADER, first);
    const res = NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
    res.cookies.set(LOCALE_COOKIE, first, {
      path: "/",
      maxAge: ONE_YEAR,
      sameSite: "lax",
    });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
