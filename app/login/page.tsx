import Link from 'next/link';
import { BookOpen, Lock, Mail, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#086288] via-[#095b7e] to-[#0d4f6c] p-4 relative overflow-hidden text-white font-sans">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#4D8DBA]/30 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#97D7FF]/20 rounded-full blur-3xl" />
      
      <div className="relative w-full max-w-md">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#97D7FF] hover:text-[#FFEFC4] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border-2 border-[#97D7FF]/30 p-8 sm:p-10 text-[#086288]">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#086288] text-[#FFEFC4] flex items-center justify-center shadow-lg border-2 border-[#4D8DBA]">
              <BookOpen className="w-8 h-8 text-[#FFEFC4]" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#086288] dark:text-white">Portal Asatidz & Admin</h1>
            <p className="text-xs text-[#4D8DBA] mt-1 font-medium">Masuk untuk mengelola penilaian dan halaqah santri</p>
          </div>
          
          <form className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#086288] dark:text-zinc-300 uppercase tracking-wider">Alamat Email / NIP</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#4D8DBA]" />
                </div>
                <input 
                  type="email" 
                  className="block w-full pl-10 pr-3.5 py-3 border border-[#4D8DBA]/25 rounded-xl bg-[#f0f7fb] dark:bg-zinc-800 text-sm text-[#086288] dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#086288] transition-all"
                  placeholder="asatidz@pesantrenquran.id"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#086288] dark:text-zinc-300 uppercase tracking-wider">Kata Sandi</label>
                <a href="#" className="text-xs font-semibold text-[#4D8DBA] hover:text-[#086288]">Lupa sandi?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#4D8DBA]" />
                </div>
                <input 
                  type="password" 
                  className="block w-full pl-10 pr-3.5 py-3 border border-[#4D8DBA]/25 rounded-xl bg-[#f0f7fb] dark:bg-zinc-800 text-sm text-[#086288] dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#086288] transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input 
                id="remember-me" 
                name="remember-me" 
                type="checkbox" 
                className="h-4 w-4 rounded border-[#4D8DBA] text-[#086288] focus:ring-[#086288]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Ingat sesi saya di perangkat ini
              </label>
            </div>
            
            <Link href="/admin" className="block pt-2">
              <button 
                type="button" 
                className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg text-sm font-bold text-[#FFEFC4] bg-[#086288] hover:bg-[#064a67] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#086288] transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                Masuk ke Dashboard
              </button>
            </Link>
          </form>
          
          <div className="mt-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Belum memiliki akun akses asatidz?{' '}
            <a href="#" className="font-bold text-[#086288] hover:underline">
              Hubungi Sekretariat Pesantren
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
