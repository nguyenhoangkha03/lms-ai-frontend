// // Enhanced Service Worker for LMS AI System with Performance Monitoring
// const CACHE_NAME = 'lms-ai-v1.0.0';
// const STATIC_CACHE = 'lms-ai-static-v1.0.0';
// const DYNAMIC_CACHE = 'lms-ai-dynamic-v1.0.0';
// const API_CACHE = 'lms-ai-api-v1.0.0';

// // Performance monitoring data
// let performanceData = {
//   cacheHits: 0,
//   cacheMisses: 0,
//   networkRequests: 0,
//   offlineRequests: 0,
//   fetchErrors: 0,
//   backgroundSyncs: 0,
// };

// // Assets to cache on install
// const STATIC_ASSETS = [
//   '/',
//   '/offline',
//   '/manifest.json',
//   '/favicon.ico',
//   '/icons/icon-192x192.png',
//   '/icons/icon-512x512.png',
//   '/_next/static/css/app.css',
//   '/_next/static/js/app.js',
// ];

// // API endpoints with different caching strategies
// const CACHEABLE_APIS = [
//   '/api/v1/courses',
//   '/api/v1/lessons',
//   '/api/v1/users/profile',
//   '/api/v1/analytics/dashboard',
// ];

// // Network-first strategies for real-time data
// const NETWORK_FIRST_ROUTES = [
//   '/api/v1/chat',
//   '/api/v1/live-sessions',
//   '/api/v1/notifications',
//   '/api/v1/auth',
// ];

// // Cache-first strategies for static content
// const CACHE_FIRST_ROUTES = [
//   '/_next/static',
//   '/images',
//   '/videos',
//   '/documents',
// ];

// // Enhanced caching strategies with performance tracking
// const cacheStrategies = {
//   staleWhileRevalidate: async (request, cacheName) => {
//     const cache = await caches.open(cacheName);
//     const cachedResponse = await cache.match(request);

//     // Background fetch to update cache
//     const fetchPromise = fetch(request)
//       .then(response => {
//         performanceData.networkRequests++;
//         if (response.ok) {
//           cache.put(request, response.clone());
//         }
//         return response;
//       })
//       .catch(error => {
//         performanceData.fetchErrors++;
//         return cachedResponse;
//       });

//     // Return cached version immediately if available
//     if (cachedResponse) {
//       performanceData.cacheHits++;
//       return cachedResponse;
//     }

//     // Otherwise wait for network
//     performanceData.cacheMisses++;
//     return await fetchPromise;
//   },

//   cacheFirst: async (request, cacheName) => {
//     const cache = await caches.open(cacheName);
//     const cachedResponse = await cache.match(request);

//     if (cachedResponse) {
//       performanceData.cacheHits++;
//       return cachedResponse;
//     }

//     performanceData.cacheMisses++;
//     performanceData.networkRequests++;

//     try {
//       const networkResponse = await fetch(request);

//       if (networkResponse.ok) {
//         cache.put(request, networkResponse.clone());
//       }

//       return networkResponse;
//     } catch (error) {
//       performanceData.fetchErrors++;
//       throw error;
//     }
//   },

//   networkFirst: async (request, cacheName) => {
//     try {
//       performanceData.networkRequests++;
//       const networkResponse = await fetch(request);

//       if (networkResponse.ok) {
//         const cache = await caches.open(cacheName);
//         cache.put(request, networkResponse.clone());
//       }

//       return networkResponse;
//     } catch (error) {
//       performanceData.fetchErrors++;
//       performanceData.offlineRequests++;

//       const cache = await caches.open(cacheName);
//       const cachedResponse = await cache.match(request);

//       if (cachedResponse) {
//         performanceData.cacheHits++;
//         return cachedResponse;
//       }

//       throw error;
//     }
//   },
// };

// // Install event - cache static assets
// self.addEventListener('install', event => {
//   console.log('Service Worker installing...');

//   event.waitUntil(
//     caches
//       .open(STATIC_CACHE)
//       .then(cache => {
//         console.log('Caching static assets...');
//         return cache.addAll(STATIC_ASSETS);
//       })
//       .then(() => {
//         console.log('Static assets cached successfully');
//         return self.skipWaiting();
//       })
//       .catch(error => {
//         console.error('Failed to cache static assets:', error);
//         performanceData.fetchErrors++;
//       })
//   );
// });

// // Activate event - clean up old caches
// self.addEventListener('activate', event => {
//   console.log('Service Worker activating...');

//   event.waitUntil(
//     caches
//       .keys()
//       .then(cacheNames => {
//         return Promise.all(
//           cacheNames.map(cacheName => {
//             if (
//               cacheName !== STATIC_CACHE &&
//               cacheName !== DYNAMIC_CACHE &&
//               cacheName !== API_CACHE
//             ) {
//               console.log('Deleting old cache:', cacheName);
//               return caches.delete(cacheName);
//             }
//           })
//         );
//       })
//       .then(() => {
//         console.log('Service Worker activated');
//         return self.clients.claim();
//       })
//   );
// });

// // Enhanced fetch handler with intelligent routing
// self.addEventListener('fetch', event => {
//   const { request } = event;
//   const url = new URL(request.url);

//   // Skip non-GET requests
//   if (request.method !== 'GET') {
//     return;
//   }

//   // Skip chrome-extension requests
//   if (url.protocol === 'chrome-extension:') {
//     return;
//   }

//   event.respondWith(
//     (async () => {
//       try {
//         // Route-based caching strategies
//         if (isStaticAsset(url.pathname)) {
//           return await cacheStrategies.cacheFirst(request, STATIC_CACHE);
//         }

//         if (isStaleWhileRevalidateAPI(url.pathname)) {
//           return await cacheStrategies.staleWhileRevalidate(request, API_CACHE);
//         }

//         if (isNetworkFirst(request.url)) {
//           return await cacheStrategies.networkFirst(request, API_CACHE);
//         }

//         if (isCacheFirst(request.url)) {
//           return await cacheStrategies.cacheFirst(request, STATIC_CACHE);
//         }

//         // Default to network first for pages
//         return await cacheStrategies.networkFirst(request, DYNAMIC_CACHE);
//       } catch (error) {
//         console.error('Fetch error:', error);
//         performanceData.fetchErrors++;
//         return await getOfflineFallback(request);
//       }
//     })()
//   );
// });

// // Get offline fallback with enhanced responses
// async function getOfflineFallback(request) {
//   const url = new URL(request.url);
//   performanceData.offlineRequests++;

//   // For navigation requests, return offline page
//   if (request.mode === 'navigate') {
//     const offlinePage = await caches.match('/offline');
//     if (offlinePage) {
//       return offlinePage;
//     }
//   }

//   // For API requests, return cached data or structured offline response
//   if (isApiCall(request.url)) {
//     const cachedResponse = await caches.match(request);
//     if (cachedResponse) {
//       return cachedResponse;
//     }

//     return new Response(
//       JSON.stringify({
//         error: 'Network unavailable',
//         message: 'This content is not available offline',
//         offline: true,
//         timestamp: new Date().toISOString(),
//       }),
//       {
//         status: 503,
//         statusText: 'Service Unavailable',
//         headers: {
//           'Content-Type': 'application/json',
//           'SW-Offline': 'true',
//         },
//       }
//     );
//   }

//   // For images, return enhanced offline placeholder
//   if (request.destination === 'image') {
//     return new Response(
//       `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
//         <defs>
//           <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
//             <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
//             <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
//           </linearGradient>
//         </defs>
//         <rect width="100%" height="100%" fill="url(#grad)"/>
//         <circle cx="150" cy="70" r="20" fill="#d1d5db"/>
//         <polygon points="130,90 170,90 190,130 110,130" fill="#d1d5db"/>
//         <text x="50%" y="160" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif" font-size="14">
//           Image unavailable offline
//         </text>
//       </svg>`,
//       {
//         headers: {
//           'Content-Type': 'image/svg+xml',
//           'SW-Offline': 'true',
//         },
//       }
//     );
//   }

//   return new Response('Content Not Available Offline', {
//     status: 404,
//     headers: { 'SW-Offline': 'true' },
//   });
// }

// // Helper functions for route identification
// function isStaticAsset(pathname) {
//   return (
//     pathname.startsWith('/_next/static/') ||
//     pathname.match(/\.(css|js|woff|woff2|ttf|eot)$/)
//   );
// }

// function isStaleWhileRevalidateAPI(pathname) {
//   return (
//     pathname.startsWith('/api/v1/courses') ||
//     pathname.startsWith('/api/v1/lessons') ||
//     pathname.startsWith('/api/v1/users/profile') ||
//     pathname.startsWith('/api/v1/analytics/dashboard')
//   );
// }

// function isNetworkFirst(url) {
//   return NETWORK_FIRST_ROUTES.some(route => url.includes(route));
// }

// function isCacheFirst(url) {
//   return CACHE_FIRST_ROUTES.some(route => url.includes(route));
// }

// function isApiCall(url) {
//   return url.includes('/api/') || CACHEABLE_APIS.some(api => url.includes(api));
// }

// // Background sync for offline actions
// self.addEventListener('sync', event => {
//   console.log('Background sync triggered:', event.tag);
//   performanceData.backgroundSyncs++;

//   if (event.tag === 'sync-offline-actions') {
//     event.waitUntil(syncOfflineActions());
//   }

//   if (event.tag === 'sync-progress') {
//     event.waitUntil(syncLearningProgress());
//   }
// });

// // Enhanced sync functions
// async function syncOfflineActions() {
//   try {
//     const db = await openDB();
//     const tx = db.transaction('offlineActions', 'readonly');
//     const store = tx.objectStore('offlineActions');
//     const actions = await store.getAll();

//     let successCount = 0;
//     let failureCount = 0;

//     for (const action of actions) {
//       try {
//         const response = await fetch(action.url, {
//           method: action.method,
//           headers: action.headers,
//           body: action.body,
//         });

//         if (response.ok) {
//           // Remove synced action
//           const deleteTx = db.transaction('offlineActions', 'readwrite');
//           const deleteStore = deleteTx.objectStore('offlineActions');
//           await deleteStore.delete(action.id);

//           successCount++;
//           console.log('Synced offline action:', action.id);
//         } else {
//           failureCount++;
//         }
//       } catch (error) {
//         console.error('Failed to sync action:', action.id, error);
//         failureCount++;
//       }
//     }

//     // Notify clients about sync results
//     self.clients.matchAll().then(clients => {
//       clients.forEach(client => {
//         client.postMessage({
//           type: 'SYNC_COMPLETE',
//           data: { successCount, failureCount, type: 'actions' },
//         });
//       });
//     });
//   } catch (error) {
//     console.error('Background sync failed:', error);
//   }
// }

// async function syncLearningProgress() {
//   try {
//     const db = await openDB();
//     const tx = db.transaction('progress', 'readonly');
//     const store = tx.objectStore('progress');
//     const progressData = await store.getAll();

//     let syncedCount = 0;

//     for (const progress of progressData.filter(p => !p.synced)) {
//       try {
//         const response = await fetch(
//           '/api/v1/analytics/data-collection/progress',
//           {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(progress.data),
//           }
//         );

//         if (response.ok) {
//           // Mark as synced
//           const updateTx = db.transaction('progress', 'readwrite');
//           const updateStore = updateTx.objectStore('progress');
//           progress.synced = true;
//           progress.syncedAt = new Date().toISOString();
//           await updateStore.put(progress);

//           syncedCount++;
//           console.log('Synced learning progress:', progress.id);
//         }
//       } catch (error) {
//         console.error('Failed to sync progress:', progress.id, error);
//       }
//     }

//     // Notify clients
//     self.clients.matchAll().then(clients => {
//       clients.forEach(client => {
//         client.postMessage({
//           type: 'SYNC_COMPLETE',
//           data: { successCount: syncedCount, type: 'progress' },
//         });
//       });
//     });
//   } catch (error) {
//     console.error('Progress sync failed:', error);
//   }
// }

// // Enhanced push notifications
// self.addEventListener('push', event => {
//   if (!event.data) return;

//   const data = event.data.json();
//   const options = {
//     body: data.body,
//     icon: '/icons/icon-192x192.png',
//     badge: '/icons/badge-72x72.png',
//     image: data.image,
//     vibrate: [100, 50, 100],
//     data: data.data,
//     actions: data.actions || [],
//     requireInteraction: data.requireInteraction || false,
//     silent: data.silent || false,
//     timestamp: Date.now(),
//     tag: data.tag || 'default',
//   };

//   event.waitUntil(
//     self.registration
//       .showNotification(data.title, options)
//       .then(() => {
//         console.log('Notification shown:', data.title);
//       })
//       .catch(error => {
//         console.error('Failed to show notification:', error);
//       })
//   );
// });

// // Enhanced notification click handler
// self.addEventListener('notificationclick', event => {
//   event.notification.close();

//   const { action, data } = event.notification;

//   event.waitUntil(
//     (async () => {
//       const clients = await self.clients.matchAll({
//         type: 'window',
//         includeUncontrolled: true,
//       });

//       // Handle specific actions
//       if (action === 'dismiss') {
//         return;
//       }

//       // If app is already open, focus it
//       for (const client of clients) {
//         if (client.url.includes(self.location.origin)) {
//           await client.focus();

//           // Send message to client
//           client.postMessage({
//             type: 'NOTIFICATION_CLICK',
//             action: action || 'default',
//             data,
//             timestamp: Date.now(),
//           });

//           return;
//         }
//       }

//       // Open new window
//       let url = '/';
//       if (data?.url) {
//         url = data.url;
//       } else if (action && data?.actionUrls?.[action]) {
//         url = data.actionUrls[action];
//       }

//       await self.clients.openWindow(url);
//     })()
//   );
// });

// // Enhanced message handler
// self.addEventListener('message', event => {
//   if (event.data && event.data.type) {
//     switch (event.data.type) {
//       case 'SKIP_WAITING':
//         self.skipWaiting();
//         break;

//       case 'CACHE_CLEAR':
//         clearCaches();
//         break;

//       case 'SYNC_REQUEST':
//         self.registration.sync.register(event.data.tag);
//         break;

//       case 'GET_PERFORMANCE_DATA':
//         event.ports[0].postMessage({
//           type: 'PERFORMANCE_DATA',
//           data: performanceData,
//         });
//         break;

//       default:
//         console.log('Unknown message type:', event.data.type);
//     }
//   }
// });

// // Performance reporting with detailed metrics
// setInterval(() => {
//   const totalRequests = performanceData.cacheHits + performanceData.cacheMisses;
//   const cacheHitRate =
//     totalRequests > 0
//       ? ((performanceData.cacheHits / totalRequests) * 100).toFixed(2)
//       : 0;

//   const detailedPerformanceData = {
//     ...performanceData,
//     cacheHitRate: `${cacheHitRate}%`,
//     totalRequests,
//     timestamp: new Date().toISOString(),
//   };

//   // Send performance data to main thread
//   self.clients.matchAll().then(clients => {
//     clients.forEach(client => {
//       client.postMessage({
//         type: 'PERFORMANCE_DATA',
//         data: detailedPerformanceData,
//       });
//     });
//   });

//   // Reset counters but keep cumulative data for this session
//   performanceData = {
//     cacheHits: 0,
//     cacheMisses: 0,
//     networkRequests: 0,
//     offlineRequests: 0,
//     fetchErrors: 0,
//     backgroundSyncs: 0,
//   };
// }, 60000); // Report every minute

// // Clear all caches
// async function clearCaches() {
//   try {
//     const cacheNames = await caches.keys();
//     await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
//     console.log('All caches cleared');

//     // Notify clients
//     self.clients.matchAll().then(clients => {
//       clients.forEach(client => {
//         client.postMessage({
//           type: 'CACHES_CLEARED',
//           timestamp: new Date().toISOString(),
//         });
//       });
//     });
//   } catch (error) {
//     console.error('Failed to clear caches:', error);
//   }
// }

// // Enhanced IndexedDB helper
// async function openDB() {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open('lms-ai-offline', 2);

//     request.onerror = () => reject(request.error);
//     request.onsuccess = () => resolve(request.result);

//     request.onupgradeneeded = event => {
//       const db = event.target.result;

//       // Create object stores
//       if (!db.objectStoreNames.contains('offlineActions')) {
//         const actionStore = db.createObjectStore('offlineActions', {
//           keyPath: 'id',
//         });
//         actionStore.createIndex('timestamp', 'timestamp');
//         actionStore.createIndex('method', 'method');
//       }

//       if (!db.objectStoreNames.contains('progress')) {
//         const progressStore = db.createObjectStore('progress', {
//           keyPath: 'id',
//         });
//         progressStore.createIndex('userId', 'userId');
//         progressStore.createIndex('synced', 'synced');
//         progressStore.createIndex('syncedAt', 'syncedAt');
//       }

//       if (!db.objectStoreNames.contains('offlineContent')) {
//         const contentStore = db.createObjectStore('offlineContent', {
//           keyPath: 'id',
//         });
//         contentStore.createIndex('courseId', 'courseId');
//         contentStore.createIndex('downloadedAt', 'downloadedAt');
//         contentStore.createIndex('size', 'size');
//       }

//       // New store for performance metrics
//       if (!db.objectStoreNames.contains('performanceMetrics')) {
//         const metricsStore = db.createObjectStore('performanceMetrics', {
//           keyPath: 'id',
//           autoIncrement: true,
//         });
//         metricsStore.createIndex('timestamp', 'timestamp');
//         metricsStore.createIndex('type', 'type');
//       }
//     };
//   });
// }
