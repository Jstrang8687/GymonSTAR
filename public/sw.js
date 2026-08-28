// Deliberately minimal: no offline caching strategy, since almost every page
// here is auth-gated and per-user (dashboard, logs, monster collection).
// Caching that content would mean serving stale/wrong-user data offline.
// This exists only to satisfy the installability requirement Chrome/Android
// checks for (a registered service worker with a fetch handler) so "Add to
// Home Screen" offers a real standalone-app install instead of a bookmark.
self.addEventListener("fetch", () => {});
