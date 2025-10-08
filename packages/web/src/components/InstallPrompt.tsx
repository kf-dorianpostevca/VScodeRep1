/**
 * PWA Install Prompt Component
 * Provides user guidance for installing the app
 */

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt(): JSX.Element {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(event);
      setShowPrompt(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember user dismissed the prompt
    localStorage.setItem('installPromptDismissed', 'true');
  };

  // Don't show if already installed or user previously dismissed
  if (isInstalled || !showPrompt || localStorage.getItem('installPromptDismissed')) {
    return <></>;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:max-w-sm z-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-lg border p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">🎯</span>
              <h3 className="font-semibold text-gray-900">Install Intelligent Todo</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Get the full app experience! Install for quick access, offline functionality, and native-like performance.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleInstallClick}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                📱 Install App
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-2 text-gray-400 hover:text-gray-600"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>

        {/* Benefits list */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex items-center">
              <span className="mr-1">⚡</span>
              <span>Faster loading</span>
            </div>
            <div className="flex items-center">
              <span className="mr-1">📱</span>
              <span>Works offline</span>
            </div>
            <div className="flex items-center">
              <span className="mr-1">🔔</span>
              <span>Push notifications</span>
            </div>
            <div className="flex items-center">
              <span className="mr-1">🏠</span>
              <span>Home screen icon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}