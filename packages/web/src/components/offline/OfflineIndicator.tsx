/**
 * Offline Indicator Component
 * Shows connection status and provides offline functionality feedback
 */

import { useState, useEffect } from 'react';

export function OfflineIndicator(): JSX.Element {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      // Hide the online indicator after 3 seconds
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator) return <></>;

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
      isOnline
        ? 'bg-green-500 text-white animate-fade-in'
        : 'bg-orange-500 text-white'
    }`}>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">
          {isOnline ? '🌐 Back Online!' : '📡 Offline Mode'}
        </span>
        {!isOnline && (
          <button
            onClick={() => setShowIndicator(false)}
            className="ml-2 text-white hover:text-gray-200"
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
      </div>
      {!isOnline && (
        <div className="text-xs mt-1 opacity-90">
          You can still view cached tasks
        </div>
      )}
    </div>
  );
}