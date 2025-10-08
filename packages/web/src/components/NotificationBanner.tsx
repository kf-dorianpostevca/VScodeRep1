/**
 * Notification Banner Component
 * Displays celebration messages, errors, and tips with animations
 */

interface NotificationBannerProps {
  type: 'success' | 'error' | 'info';
  message: string;
  celebrationTip?: string;
  onDismiss?: () => void;
}

/**
 * Notification banner for celebration messages and feedback
 */
export function NotificationBanner({
  type,
  message,
  celebrationTip,
  onDismiss
}: NotificationBannerProps): JSX.Element {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: '🎉',
          iconBg: 'bg-green-200'
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: '⚠️',
          iconBg: 'bg-red-200'
        };
      default:
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: 'ℹ️',
          iconBg: 'bg-blue-200'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`border rounded-lg p-4 mb-6 ${styles.container} animate-fade-in`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm ${styles.iconBg} mr-3`}>
          {styles.icon}
        </div>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
          {celebrationTip && (
            <p className="text-sm mt-1 opacity-90">
              💡 {celebrationTip}
            </p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}