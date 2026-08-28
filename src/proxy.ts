import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const PUBLIC_ROUTES = ["/login", "/register"];

export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isLoggedIn = Boolean(req.auth);

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // PWA assets (manifest, icons, service worker) are fetched by the browser/
  // OS without any auth context -- e.g. iOS checks the manifest and icons
  // before the user has ever logged in -- so they can't be behind the
  // login redirect the way real app pages are.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|icon|icon-192.png|icon-512.png|apple-icon|sw.js).*)",
  ],
};
