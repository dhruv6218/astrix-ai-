import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      setTimeout(() => setShowRestored(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestored) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 py-2.5 text-sm font-bold transition-all duration-300 ${
      isOnline && showRestored
        ? 'bg-green-600 text-white animate-[fadeIn_0.3s_ease-out]'
        : 'bg-gray-900 text-white animate-[fadeIn_0.3s_ease-out]'
    }`}>
      {isOnline && showRestored ? (
        <>
          <Wifi className="w-4 h-4" />
          You&apos;re back online!
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          You are offline — changes will be saved locally
        </>
      )}
    </div>
  );
};
