import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Reachable by anyone, signed in or not. The legal pages have to be readable
// before an account exists (and by app-store reviewers), and the email-link
// flows can be opened in either state -- a reset link by someone who can't
// sign in, a verify link by someone who still has a session open.
const OPEN_ROUTES = ["/privacy", "/terms", "/forgot-password", "/reset-password", "/verify-email"];

// Only meaningful before signing in; signed-in users get sent on to the app.
const GUEST_ONLY_ROUTES = ["/login", "/register"];

export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = Boolean(req.auth);

  if (OPEN_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  const isGuestOnly = GUEST_ONLY_ROUTES.includes(pathname);

  if (!isLoggedIn && !isGuestOnly) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoggedIn && isGuestOnly) {
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
