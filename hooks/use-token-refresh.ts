"use client";

import { useCallback } from 'react';

export function useTokenRefresh() {
  const refreshTokenStatus = useCallback(() => {
    // Dispatch a custom event that token status components can listen to
    console.log('Dispatching token refresh event');
    window.dispatchEvent(new CustomEvent('tokenStatusRefresh'));
    
    // Also try to refresh by dispatching a storage event as a fallback
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'tokenRefresh',
      newValue: Date.now().toString(),
      storageArea: localStorage
    }));
  }, []);

  return { refreshTokenStatus };
}
