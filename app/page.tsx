'use client';

import Link from 'next/link';
import { ShieldCheck, Lock, Clock, MapPin, EyeOff, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header / Navbar */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">
              ShareLokasi
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <a href="#cara-kerja" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Cara Kerja
            </a>
            <Link
              href="/dashboard"
              className="text-sm px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors"
            >
              Buat Sesi Lokasi
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
          <span>Berbasis Izin Izin Peramban Eksplisit</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Berbagi Lokasi Aman & Transparan
        </h1>

        <p className="mt-4 text-lg text-slate-600 max-w-2xl leading-relaxed">
          Bagikan lokasi perangkat Anda secara akurat hanya saat Anda mengizinkannya. Bebas pelacakan tersembunyi, tanpa fingerprinting, dan sesi otomatis terhapus.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm flex items-center justify-center space-x-2 transition-colors text-sm"
          >
            <span>Buat Link Tautan Lokasi</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#fitur"
            className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-sm transition-colors text-center shadow-sm"
          >
            Pelajari Fitur Privasi
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-16 px-6 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Prinsip Keamanan & Privasi
            </h2>
            <p className="text-slate-600 mt-2 text-sm">
              Didesain sederhana seperti aplikasi web profesional standar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Lock className="w-5 h-5 text-blue-600" />,
                title: "Izin Eksplisit",
                desc: "Lokasi hanya dikirimkan setelah penerima menekan tombol 'Izinkan Lokasi'."
              },
              {
                icon: <Clock className="w-5 h-5 text-blue-600" />,
                title: "Sesi Sementara",
                desc: "Setiap tautan memiliki batas waktu (15 menit hingga 24 jam) dan otomatis kedaluwarsa."
              },
              {
                icon: <EyeOff className="w-5 h-5 text-blue-600" />,
                title: "Tanpa Pelacakan IP",
                desc: "Sistem tidak menyimpan fingerprint browser, IP target, atau data yang tidak diperlukan."
              },
              {
                icon: <MapPin className="w-5 h-5 text-blue-600" />,
                title: "GPS Perangkat",
                desc: "Memanfaatkan HTML5 Geolocation API bawaan browser untuk akurasi posisi terbaik."
              }
            ].map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-start"
              >
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 text-base mb-1">{f.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="cara-kerja" className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">3 Langkah Mudah</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm mb-3">
              1
            </div>
            <h4 className="font-semibold text-slate-900 text-base mb-1">Buat Tautan Sesi</h4>
            <p className="text-xs text-slate-600">Tentukan nama sesi dan masa berlaku tautan sesuai kebutuhan Anda.</p>
          </div>
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm mb-3">
              2
            </div>
            <h4 className="font-semibold text-slate-900 text-base mb-1">Kirim Tautan / QR</h4>
            <p className="text-xs text-slate-600">Bagikan tautan atau kode QR kepada rekan Anda.</p>
          </div>
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm mb-3">
              3
            </div>
            <h4 className="font-semibold text-slate-900 text-base mb-1">Penerima Setuju</h4>
            <p className="text-xs text-slate-600">Setelah penerima mengeklik izin lokasi, koordinat akan tampil di peta Anda.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} ShareLokasi. Aplikasi Berbagi Lokasi Berbasis Izin Peramban.</p>
          <div className="flex items-center space-x-4 text-slate-500">
            <span>Privasi Terjaga</span>
            <span>·</span>
            <span>Koneksi HTTPS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
