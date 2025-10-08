/**
 * PWA Utilities
 * Helper functions for Progressive Web App functionality
 */

export class PWAUtils {
  /**
   * Check if the app is running as an installed PWA
   */
  static isInstalled(): boolean {
    // Check for standalone mode (most reliable)
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    // Check for iOS Safari add-to-home-screen
    if ((window.navigator as any).standalone === true) {
      return true;
    }

    // Check for Android Chrome add-to-home-screen
    if (window.matchMedia && window.matchMedia('(display-mode: minimal-ui)').matches) {
      return true;
    }

    return false;
  }

  /**
   * Check if PWA installation is available
   */
  static isInstallable(): boolean {
    return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
  }

  /**
   * Register service worker
   */
  static async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is available
              PWAUtils.showUpdateAvailable();
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  /**
   * Show update available notification
   */
  static showUpdateAvailable(): void {
    // Create a simple update notification
    const updateBanner = document.createElement('div');
    updateBanner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #3b82f6;
        color: white;
        padding: 12px;
        text-align: center;
        z-index: 1000;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <span>🎉 New version available! </span>
        <button onclick="window.location.reload()" style="
          background: white;
          color: #3b82f6;
          border: none;
          padding: 4px 12px;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          margin-left: 8px;
        ">Update Now</button>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: transparent;
          color: white;
          border: 1px solid white;
          padding: 4px 12px;
          border-radius: 4px;
          cursor: pointer;
          margin-left: 8px;
        ">Later</button>
      </div>
    `;
    document.body.appendChild(updateBanner);
  }

  /**
   * Check online status
   */
  static isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Request background sync (if supported)
   */
  static async requestBackgroundSync(tag: string): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // Use type assertion for sync API which may not be in all TypeScript definitions
        await (registration as any).sync.register(tag);
        console.log('Background sync registered:', tag);
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    }
  }

  /**
   * Clear app caches
   */
  static async clearCaches(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
    }
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<{ name: string; size: number }[]> {
    if (!('caches' in window)) return [];

    const cacheNames = await caches.keys();
    const stats = await Promise.all(
      cacheNames.map(async (name) => {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        return { name, size: keys.length };
      })
    );

    return stats;
  }

  /**
   * Show install instructions for different platforms
   */
  static showInstallInstructions(): void {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    let instructions = '';

    if (isIOS) {
      instructions = `
        <div>
          <h3>Install on iOS</h3>
          <ol>
            <li>Tap the Share button <span style="font-size: 18px;">⬆️</span></li>
            <li>Scroll down and tap "Add to Home Screen"</li>
            <li>Tap "Add" to confirm</li>
          </ol>
        </div>
      `;
    } else if (isAndroid) {
      instructions = `
        <div>
          <h3>Install on Android</h3>
          <ol>
            <li>Tap the menu button <span style="font-size: 18px;">⋮</span></li>
            <li>Tap "Add to Home screen" or "Install app"</li>
            <li>Tap "Add" to confirm</li>
          </ol>
        </div>
      `;
    } else {
      instructions = `
        <div>
          <h3>Install on Desktop</h3>
          <ol>
            <li>Look for the install icon in your browser's address bar</li>
            <li>Click "Install" when prompted</li>
            <li>Or use Chrome menu → "Install Intelligent Todo"</li>
          </ol>
        </div>
      `;
    }

    // Create modal
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div style="
          background: white;
          padding: 24px;
          border-radius: 12px;
          max-width: 400px;
          margin: 20px;
        ">
          ${instructions}
          <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" style="
            background: #3b82f6;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 16px;
          ">Got it!</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Track PWA usage analytics
   */
  static trackPWAUsage(): void {
    const isInstalled = PWAUtils.isInstalled();
    const isOnline = PWAUtils.isOnline();

    console.log('PWA Usage:', {
      installed: isInstalled,
      online: isOnline,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });

    // In production, this would send analytics to your tracking service
  }
}