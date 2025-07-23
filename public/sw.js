// A list of known ad and tracking domains to block.
// This list can be expanded over time.
const BLOCK_LIST = [
  'ocpydtjcvcxug.site',
  'youradexchange.com',
  'mydzcajckvmzp.website',
  // Keywords found in typical ad/redirect paths
  'ad.visit.php',
  '/ad',
  'pop.php',
  'visit.php',
];

// We need to check if the request URL contains any of the blocked keywords.
const isBlocked = (url) => {
  try {
    const requestUrl = new URL(url);
    // Also block navigations to the same origin if they look like ad paths
    if (requestUrl.origin === self.location.origin && BLOCK_LIST.some(path => url.includes(path))) {
      return true;
    }
    // Block navigations to external domains on the block list
    return BLOCK_LIST.some(domainOrPath => url.includes(domainOrPath));
  } catch (e) {
    // Invalid URL, don't block
    return false;
  }
};


self.addEventListener('fetch', (event) => {
  const request = event.request;

  // We are only interested in navigation requests that would change the page or open a new tab.
  if (request.mode === 'navigate') {
    if (isBlocked(request.url)) {
      console.log(`[SW] Blocking navigation to: ${request.url}`);
      
      // Respond with a "204 No Content". This effectively cancels the navigation
      // without showing an error to the user or the requesting script.
      // It's a silent block.
      event.respondWith(new Response(null, { status: 204 }));
    }
  }
});

// This ensures the service worker activates immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all pages under its scope immediately.
  event.waitUntil(self.clients.claim());
});
