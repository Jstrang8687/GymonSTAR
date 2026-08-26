import { signOut } from "@/lib/auth";

// Route Handlers (unlike Server Components) are allowed to mutate cookies,
// so orphaned sessions (e.g. the underlying user was deleted) get routed
// here to clear the cookie cleanly instead of crashing downstream writes.
export async function GET() {
  await signOut({ redirectTo: "/login" });
}
