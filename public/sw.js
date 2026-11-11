// Increment the cache version when publishing a changed application shell.
const CACHE_NAME = "ssms-app-shell-v2";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest", "/icons/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const response = await fetch("/index.html");
    if (!response.ok) {
      throw new Error("The application shell could not be cached.");
    }
    const html = await response.text();
    const builtAssets = Array.from(
      html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/g),
      (match) => match[1],
    );
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll([...APP_SHELL, ...builtAssets]);
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith("ssms-app-shell-") && key !== CACHE_NAME)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put("/index.html", response.clone());
        }
        return response;
      } catch {
        return (await caches.match("/index.html"))
          || new Response("The application shell is not available offline yet.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
      }
    })());
    return;
  }

  if (/^\/assets\/.+\.(?:js|css|svg|woff2?)$/.test(url.pathname)
    || APP_SHELL.includes(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }
      const response = await fetch(request);
      if (response.ok) {
        await cache.put(request, response.clone());
      }
      return response;
    })());
  }
});
