// No offline caching strategy, since almost every page here is auth-gated
// and per-user (dashboard, logs, monster collection). Caching that content
// would mean serving stale/wrong-user data offline. The fetch handler exists
// only to satisfy the installability requirement Chrome/Android checks for
// (a registered service worker with a fetch handler) so "Add to Home
// Screen" offers a real standalone-app install instead of a bookmark.
self.addEventListener("fetch", () => {});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const payload = event.data.json();
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: payload.url ?? "/" },
    })
  );
});

// Focuses an already-open tab on the target URL instead of always opening a
// new one, since most people will already have the app open somewhere.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
