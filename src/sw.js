import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

// Precache assets
precacheAndRoute(self.__WB_MANIFEST)

// Cleanup outdated caches
cleanupOutdatedCaches()

// Don't use skipWaiting() - wait for users to close all tabs before activating
// This prevents forced activation on mobile which causes blank screen

// Don't use clientsClaim() - don't immediately take control of all clients
// This prevents the service worker from forcefully taking over on mobile

// Handle navigation - fallback to index.html for SPA
const navigationHandler = new NavigationRoute(
  new NetworkFirst({
    cacheName: 'navigation-cache',
  }),
  {
    allowlist: [/^\/$/],
  }
)
registerRoute(navigationHandler)

// Cache feedback routes
registerRoute(
  /^\/feedback\/.*/,
  new NetworkFirst({
    cacheName: 'feedback-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 86400,
      }),
    ],
  }),
  'GET'
)
