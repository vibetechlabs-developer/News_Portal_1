self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch (err) {
    payload = { title: "Kanam Express", body: event.data.text() };
  }

  const title = payload.title || "Kanam Express";
  const relativeUrl = payload.url || "/";
  const openUrl =
    typeof relativeUrl === "string" && relativeUrl.startsWith("http")
      ? relativeUrl
      : new URL(relativeUrl, self.location.origin).href;

  const options = {
    body: payload.body || "New update available",
    icon: "/news-favicon.svg",
    badge: "/news-favicon.svg",
    tag: payload.tag || "kanam-news",
    renotify: true,
    requireInteraction: false,
    data: {
      url: openUrl,
    },
    vibrate: [120, 80, 120],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw = event.notification?.data?.url || self.location.origin + "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          try {
            client.navigate(raw);
          } catch (_) {
            /* fallback below */
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(raw);
      }
    })
  );
});
