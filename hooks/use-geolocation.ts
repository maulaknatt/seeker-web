import { useState, useCallback, useRef } from 'react';

export interface GeolocationState {
  loading: boolean;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  altitude: number | null;
  speed: number | null;
  error: string | null;
  errorCode: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'INSECURE_CONTEXT' | 'UNSUPPORTED' | null;
  status: 'idle' | 'requesting' | 'granted' | 'denied' | 'error' | 'unsupported';
  isWatching: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    latitude: null,
    longitude: null,
    accuracy: null,
    altitude: null,
    speed: null,
    error: null,
    errorCode: null,
    status: 'idle',
    isWatching: false
  });

  const watchIdRef = useRef<number | null>(null);

  const getCurrentLocation = useCallback((onSuccess?: (coords: { lat: number; lng: number; accuracy: number; alt?: number | null; speed?: number | null }) => void) => {
    if (typeof window === 'undefined') return;

    // Check secure context
    if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setState(prev => ({
        ...prev,
        loading: false,
        status: 'error',
        errorCode: 'INSECURE_CONTEXT',
        error: 'Geolocation requires a secure context (HTTPS). Please access over HTTPS.'
      }));
      return;
    }

    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        loading: false,
        status: 'unsupported',
        errorCode: 'UNSUPPORTED',
        error: 'Geolocation is not supported by your browser.'
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, status: 'requesting', error: null, errorCode: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy, altitude, speed } = position.coords;
        setState({
          loading: false,
          latitude,
          longitude,
          accuracy,
          altitude: altitude ?? null,
          speed: speed ?? null,
          error: null,
          errorCode: null,
          status: 'granted',
          isWatching: false
        });

        if (onSuccess) {
          onSuccess({
            lat: latitude,
            lng: longitude,
            accuracy,
            alt: altitude,
            speed
          });
        }
      },
      (error) => {
        let code: GeolocationState['errorCode'] = 'POSITION_UNAVAILABLE';
        let msg = 'Unable to retrieve location.';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            code = 'PERMISSION_DENIED';
            msg = 'Location permission denied by user or browser policy.';
            break;
          case error.POSITION_UNAVAILABLE:
            code = 'POSITION_UNAVAILABLE';
            msg = 'Location information is unavailable on your device.';
            break;
          case error.TIMEOUT:
            code = 'TIMEOUT';
            msg = 'Location request timed out. Please try again.';
            break;
        }

        setState({
          loading: false,
          latitude: null,
          longitude: null,
          accuracy: null,
          altitude: null,
          speed: null,
          error: msg,
          errorCode: code,
          status: code === 'PERMISSION_DENIED' ? 'denied' : 'error',
          isWatching: false
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }, []);

  const startWatching = useCallback((onUpdate?: (coords: { lat: number; lng: number; accuracy: number }) => void) => {
    if (!navigator.geolocation) return;

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setState(prev => ({ ...prev, loading: true, isWatching: true }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, altitude, speed } = position.coords;
        setState({
          loading: false,
          latitude,
          longitude,
          accuracy,
          altitude: altitude ?? null,
          speed: speed ?? null,
          error: null,
          errorCode: null,
          status: 'granted',
          isWatching: true
        });

        if (onUpdate) {
          onUpdate({ lat: latitude, lng: longitude, accuracy });
        }
      },
      (error) => {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message,
          errorCode: error.code === 1 ? 'PERMISSION_DENIED' : 'POSITION_UNAVAILABLE',
          status: error.code === 1 ? 'denied' : 'error'
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 5000
      }
    );
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState(prev => ({ ...prev, isWatching: false }));
  }, []);

  return {
    ...state,
    getCurrentLocation,
    startWatching,
    stopWatching
  };
}
