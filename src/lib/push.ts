import "server-only";
import webpush from "web-push";
import { prisma } from "@/lib/prisma";

// Best-effort by design, same as email.ts -- nothing in the app should ever
// fail because a push notification couldn't be sent.
let configured = false;
function ensureConfigured(): boolean {
  if (configured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export interface PushPayload {
  title: string;
  body: string;
  /** Relative URL to open when the notification is tapped, e.g. "/battle". */
  url: string;
}

// Sends to every device the user has notifications enabled on. A
// subscription the push service reports as gone (410/404 -- the user
// uninstalled, cleared data, etc.) is deleted so we stop retrying it.
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  if (!ensureConfigured()) {
    console.warn("[push] VAPID keys not set -- skipping push to", userId);
    return;
  }

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subscriptions.length === 0) return;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        } else {
          console.error("[push] Failed to send to", sub.id, error);
        }
      }
    })
  );
}
