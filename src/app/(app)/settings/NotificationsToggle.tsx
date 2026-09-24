"use client";

import { useEffect, useState, useTransition } from "react";
import { subscribeToPush, unsubscribeFromPush } from "./actions";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

// Push subscription keys arrive as URL-safe base64; the browser's
// applicationServerKey option wants a raw Uint8Array instead.
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64Safe);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

type Status = "checking" | "unsupported" | "off" | "on" | "denied";

// Notification permission is per-device, so this only ever reflects and
// controls the subscription for the device it's rendered on.
export function NotificationsToggle() {
  const [status, setStatus] = useState<Status>("checking");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    Promise.resolve().then(async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !VAPID_PUBLIC_KEY) {
        setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setStatus("denied");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setStatus(sub ? "on" : "off");
      } catch {
        setStatus("off");
      }
    });
  }, []);

  function enable() {
    startTransition(async () => {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!) as BufferSource,
      });
      await subscribeToPush(sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } });
      setStatus("on");
    });
  }

  function disable() {
    startTransition(async () => {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await unsubscribeFromPush(sub.endpoint);
        await sub.unsubscribe();
      }
      setStatus("off");
    });
  }

  if (status === "checking") return null;
  if (status === "unsupported") return null;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
      <span>
        <span className="block font-bold text-white">Duel notifications</span>
        <span className="block text-sm text-slate-400">
          {status === "denied"
            ? "Blocked in your browser's site settings -- enable them there to turn this on."
            : "Get notified on this device when someone challenges you."}
        </span>
      </span>
      {status !== "denied" && (
        <button
          type="button"
          disabled={pending}
          onClick={status === "on" ? disable : enable}
          className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-sm font-semibold text-white transition hover:border-amber-400/50 disabled:opacity-60"
        >
          {pending ? "..." : status === "on" ? "On" : "Off"}
        </button>
      )}
    </div>
  );
}
