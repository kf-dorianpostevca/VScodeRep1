// Enhanced Service Worker for Intelligent Todo PWA
const CACHE_NAME = 'intelligent-todo-v2';
const STATIC_CACHE = 'static-v2';
const DATA_CACHE = 'data-v2';
const OFFLINE_URL = '/offline.html';

// Static assets to cache
const staticAssets = [
  '/',
  '/analytics',
  '/manifest.json',
  '/offline.html',
  // Icons
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache for offline access
const apiEndpoints = [
  '/api/v1/tasks',
  '/api/v1/analytics/monthly'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    (async () => {
      const staticCache = await caches.open(STATIC_CACHE);
      await staticCache.addAll(staticAssets);
      console.log('[SW] Static assets cached');
      self.skipWaiting();
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DATA_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
      self.clients.claim();
    })()
  );
});

// Fetch event - smart caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/v1/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(handleStaticRequest(request));
});

// Network-first strategy for API requests
async function handleApiRequest(request) {
  try {
    const response = await fetch(request);

    // Cache successful GET requests
    if (response.ok && request.method === 'GET') {
      const dataCache = await caches.open(DATA_CACHE);
      dataCache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed for API request:', request.url);

    // Try to return cached version for GET requests
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        console.log('[SW] Returning cached API response');
        return cachedResponse;
      }
    }

    // Return offline response for failed API requests
    return new Response(
      JSON.stringify({
        success: false,
        error: 'You are offline. Some features may not work.',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle navigation requests with offline fallback
async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    console.log('[SW] Network failed for navigation:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for failed navigation
    return caches.match(OFFLINE_URL) || new Response('Offline');
  }
}

// Cache-first strategy for static assets
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      const staticCache = await caches.open(STATIC_CACHE);
      staticCache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Failed to fetch static asset:', request.url);

    // Return offline page for HTML requests
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match(OFFLINE_URL) || new Response('Offline');
    }

    throw error;
  }
}

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'data-sync') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(syncData());
  }
});

// Sync data when connection is restored
async function syncData() {
  try {
    // Clear stale data cache to force fresh data on next request
    const dataCache = await caches.open(DATA_CACHE);
    const keys = await dataCache.keys();

    await Promise.all(
      keys.map(request => {
        // Clear cached API responses to ensure fresh data
        if (request.url.includes('/api/v1/')) {
          return dataCache.delete(request);
        }
      })
    );

    console.log('[SW] Data cache cleared for fresh sync');
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_STATUS') {
    event.ports[0].postMessage({
      staticCacheSize: 0, // Will be populated by actual cache inspection
      dataCacheSize: 0
    });
  }
});