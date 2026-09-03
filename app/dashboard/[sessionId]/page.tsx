'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Clock,
  Users,
  MapPin,
  RefreshCw,
  Copy,
  Check,
  StopCircle,
  ArrowLeft,
  Activity,
  Layers,
  Globe,
  ExternalLink
} from 'lucide-react';
import LocationMap from '@/components/map/LocationMap';
import { LocationSession, LocationRecord } from '@/types';
import { formatTimeRemaining } from '@/lib/utils';

export default function SingleSessionDashboardPage() {
  const params = useParams();
  const sessionId = params?.sessionId as string;

  const [session, setSession] = useState<LocationSession | null>(null);
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [ending, setEnding] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSessionData = useCallback(async (isManualRefresh = false) => {
    if (!sessionId) return;
    if (isManualRefresh) setIsRefreshing(true);

    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (!res.ok) {
        throw new Error('Sesi tidak ditemukan atau telah ditutup.');
      }
      const data = await res.json();
      setSession(data.session);
      setLocations(data.locations || []);
      setVisitorCount(data.visitorCount || 0);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data sesi.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSessionData();

    const interval = setInterval(() => {
      fetchSessionData();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchSessionData]);

  const handleCopyShareLink = () => {
    if (!session) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/share/${session.session_code}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleEndSession = async () => {
    if (!confirm('Apakah Anda yakin ingin mengakhiri sesi ini?')) return;
    setEnding(true);

    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end' })
      });

      if (res.ok) {
        fetchSessionData(true);
      }
    } catch (err) {
      console.error('Gagal mengakhiri sesi:', err);
    } finally {
      setEnding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 font-sans">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-xs text-slate-600 font-medium">Memuat Dashboard Peta...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Sesi Tidak Ditemukan</h2>
        <p className="text-xs text-slate-600 max-w-sm mb-6">{error || 'Sesi tidak dapat diakses.'}</p>
        <Link href="/dashboard" className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-medium shadow-sm">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      {/* Sidebar Minimal */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-6">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-base text-slate-900 tracking-tight">ShareLokasi</span>
          </Link>

          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium text-xs border border-blue-100"
            >
              <Layers className="w-4 h-4" />
              <span>Dashboard Pemantau</span>
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-200">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Buat Link Tautan Baru</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{session.title}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center space-x-1.5 ${
                  session.status === 'active'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    session.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                  }`}
                />
                <span className="capitalize">{session.status}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">Kode Sesi: {session.session_code}</p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => fetchSessionData(true)}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors text-xs flex items-center space-x-1.5 shadow-sm"
              title="Perbarui Peta & Lokasi"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
              <span className="hidden sm:inline">Perbarui</span>
            </button>

            <button
              onClick={handleCopyShareLink}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Tautan'}</span>
            </button>

            {session.status === 'active' && (
              <button
                onClick={handleEndSession}
                disabled={ending}
                className="px-3.5 py-2 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                <StopCircle className="w-3.5 h-3.5" />
                <span>Akhiri Sesi</span>
              </button>
            )}
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Target URL Info Banner */}
          {session.target_url && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800">Target Website Redirect:</span>{' '}
                  <span className="font-mono text-blue-700">{session.target_url}</span>
                </div>
              </div>
              <a
                href={session.target_url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center space-x-1 font-medium"
              >
                <span>Buka Target</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pengunjung</span>
                <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{visitorCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pembaruan Lokasi</span>
                <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{locations.length}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sisa Waktu Sesi</span>
                <h3 className="text-base font-bold text-blue-600 mt-0.5">
                  {formatTimeRemaining(session.expires_at)}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Peta Pemantauan Lokasi Realtime</span>
              </h3>
              <span className="text-xs text-slate-500">Pembaruan otomatis tiap 5 detik</span>
            </div>

            <LocationMap locations={locations} sessionTitle={session.title} />
          </div>

          {/* Location Records Table */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider">Riwayat Koordinat Masuk</h4>
            {locations.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                Belum ada data koordinat yang diterima dari penerima tautan ini.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Waktu</th>
                      <th className="py-2.5 px-3">Latitude</th>
                      <th className="py-2.5 px-3">Longitude</th>
                      <th className="py-2.5 px-3">Akurasi Radius</th>
                      <th className="py-2.5 px-3">Google Maps</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {locations.map((loc, idx) => (
                      <tr key={loc.id || idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400">{locations.length - idx}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-900">
                          {new Date(loc.created_at || loc.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2.5 px-3 text-blue-600">{loc.latitude.toFixed(6)}</td>
                        <td className="py-2.5 px-3 text-blue-600">{loc.longitude.toFixed(6)}</td>
                        <td className="py-2.5 px-3 text-emerald-700 font-sans">~{Math.round(loc.accuracy)} meter</td>
                        <td className="py-2.5 px-3 font-sans">
                          <a
                            href={`https://www.google.com/maps/place/${loc.latitude}+${loc.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 text-[11px] font-medium transition-colors border border-blue-200"
                          >
                            <span>Google Maps</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
