export const setupApiClient = () => {
  // Setup cache cleanup interval
  const cache = ApiCache.getInstance();

  // Clean expired cache entries every 5 minutes
  setInterval(
    () => {
      cache.clearExpired();
    },
    5 * 60 * 1000
  );

  // Setup global error handling
  window.addEventListener('unhandledrejection', event => {
    if (event.reason?.name === 'AbortError') {
      // Ignore cancelled requests
      event.preventDefault();
      return;
    }

    console.error('Unhandled API error:', event.reason);
  });

  console.log('API client setup complete');
};
