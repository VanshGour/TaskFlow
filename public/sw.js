
const CACHE_NAME = 'taskflow-cache-v2'

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      await cache.add('/')
      await self.skipWaiting()
    })()
  )
})

// Activate Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys()

      await Promise.all(
        cacheNames
          .filter(name => name.startsWith('taskflow-cache-') && name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )

      await self.clients.claim()
    })()
  )
})

// Handle network requests
self.addEventListener('fetch', event => {
  const request = event.request

  if (
    request.method !== 'GET' ||
    new URL(request.url).origin !== self.location.origin
  ) {
    return
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME)

      // Serve cached files immediately when available
      const cachedResponse = await cache.match(request)

      if (cachedResponse) {
        return cachedResponse
      }

      // Otherwise fetch and save the response
      try {
        const response = await fetch(request)

        if (response.ok && response.type === 'basic') {
          await cache.put(request, response.clone())
        }

        return response
      } catch {
        // Use cached application page if navigation fails
        if (request.mode === 'navigate') {
          return (
            await cache.match('/') ||
            new Response('TaskFlow is unavailable offline.', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            })
          )
        }

        return new Response('', { status: 503 })
      }
    })()
  )
})
