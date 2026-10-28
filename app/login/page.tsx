"use client";

import { useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, User, Eye, EyeOff, Loader2, AlertCircle, Shield } from 'lucide-react';

function CurrentYear() {
  return <>{new Date().getFullYear()}</>;
}

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Harap masukkan username/email dan kata sandi administrator.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim(),
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Autentikasi gagal. Akses khusus administrator.');
        return;
      }

      if (data.user) {
        localStorage.setItem('admin_user', JSON.stringify(data.user));
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setErrorMessage('Terjadi kendala koneksi ke server. Silakan coba beberapa saat lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 text-zinc-800 font-sans antialiased overflow-hidden">
      {/* Background Gambar Gedung Pesantren */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/bg-login.jpg"
          alt="Gedung Pesantren Ilmu Al-Qur'an"
          fill
          priority
          className="object-cover object-center scale-105"
        />
        {/* Overlay Elegan bertema Biru Lembaga */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#041924]/95 via-[#072d3e]/85 to-[#072d3e]/75 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Kartu Login Administrator */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-7 sm:p-9">
          {/* Header Lembaga */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 mb-3 relative flex items-center justify-center">
              <Image
                src="/logo-piq.png"
                alt="Logo Pesantren Ilmu Al-Qur'an"
                width={64}
                height={64}
                className="w-16 h-16 object-contain"
                priority
              />
            </div>
            
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#086288] bg-[#086288]/10 px-2.5 py-0.5 rounded-full mb-1.5">
              Portal Administrator
            </span>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Pesantren Ilmu Al-Qur&apos;an
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Muharrik Al Quran Pesantren Ilmu Al Quran
            </p>
          </div>

          {/* Kotak Peringatan Kesalahan */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Formulir Login Admin */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block font-semibold text-zinc-700">
                Username / Email Admin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <User className="h-4 w-4" />
                </div>
                <input 
                  type="text" 
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#086288] focus:border-[#086288] transition-all bg-white"
                  placeholder="Masukkan username atau email admin"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="block font-semibold text-zinc-700">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#086288] focus:border-[#086288] transition-all bg-white"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="h-3.5 h-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-zinc-300 text-[#086288] focus:ring-[#086288] cursor-pointer"
                />
                <span className="ml-2 text-zinc-600 font-medium text-[11px]">
                  Ingat sesi di perangkat ini
                </span>
              </label>
            </div>
            
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs text-white bg-[#086288] hover:bg-[#064e6d] focus:outline-none focus:ring-2 focus:ring-[#086288] transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Memverifikasi Akses...</span>
                  </>
                ) : (
                  <span>Masuk ke Panel Admin</span>
                )}
              </button>
            </div>
          </form>
          {/* Footer Akses Terbatas
          <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-center gap-1.5 text-zinc-400 text-[11px]">
            <Shield className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>Akses khusus Administrator Madrasah / IT Pesantren</span>
          </div> */}
        </div>

        {/* Copyright Footer */}
        <p className="mt-4 text-center text-[11px] text-zinc-300 drop-shadow-sm font-medium">
          &copy;{" "}
          <Suspense fallback={<span>2026</span>}>
            <CurrentYear />
          </Suspense>{" "}
          Pesantren Ilmu Al Quran
        </p>
      </div>
    </div>
  );
}
