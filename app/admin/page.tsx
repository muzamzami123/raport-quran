import {
  Users,
  UserCheck,
  BookOpen,
  BookOpenCheck,
  BookMarked,
  Layers,
  Calendar,
  ArrowRight
} from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Muharrik Qur an Pesantren Ilmu Al Quran</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-[#FFF6A9]/30 transition-colors">
            Unduh Laporan
          </button>
          <button className="px-4 py-2 bg-[#B4E4D6] border border-[#B4E4D6] text-zinc-900 text-sm font-semibold hover:bg-[#a1d6c6] transition-colors">
            Tambah Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL SANTRI"
          value="1,248"
          trend="+12% bulan ini"
          trendUp={true}
          icon={<Users className="w-5 h-5 text-zinc-800" />}
          iconBg="bg-[#FFCA88]"
        />
        <StatCard
          title="TOTAL GURU"
          value="45"
          trend="+2 guru baru"
          trendUp={true}
          icon={<UserCheck className="w-5 h-5 text-white" />}
          iconBg="bg-[#DE7272]"
        />
        <StatCard
          title="KELAS MUROTTAL"
          value="12"
          trend="Aktif"
          trendUp={true}
          icon={<BookOpen className="w-5 h-5 text-zinc-800" />}
          iconBg="bg-[#FFF6A9]"
        />
        <StatCard
          title="KELAS MUROJAAH"
          value="8"
          trend="Aktif"
          trendUp={true}
          icon={<BookOpenCheck className="w-5 h-5 text-zinc-800" />}
          iconBg="bg-[#B4E4D6]"
        />
        <StatCard
          title="KELAS TAFSIR"
          value="4"
          trend="Aktif"
          trendUp={true}
          icon={<BookMarked className="w-5 h-5 text-zinc-800" />}
          iconBg="bg-[#FFCA88]"
        />
        <StatCard
          title="TOTAL SEMUA KELAS"
          value="24"
          trend="3 program"
          trendUp={true}
          icon={<Layers className="w-5 h-5 text-white" />}
          iconBg="bg-[#DE7272]"
        />
        <div className="md:col-span-2 lg:col-span-2 h-full">
          <StatCard
            title="TAHUN AJARAN"
            value="2026/2027"
            trend="Semester Ganjil"
            trendUp={true}
            icon={<Calendar className="w-5 h-5 text-zinc-800" />}
            iconBg="bg-[#B4E4D6]"
            className="h-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">Aktivitas Terbaru</h2>
            <button className="text-xs font-medium text-zinc-500 hover:text-[#DE7272] transition-colors">Lihat Semua</button>
          </div>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {[
              { name: "Ustadz Ahmad", action: "memperbarui nilai tahfidz", target: "Kelas 5A", time: "2 jam yang lalu", color: "bg-[#FFCA88]" },
              { name: "Ustadzah Fatimah", action: "mencetak raport", target: "Kelas 3B", time: "4 jam yang lalu", color: "bg-[#B4E4D6]" },
              { name: "Admin Utama", action: "menambahkan data siswa baru", target: "Ahmad Zaki", time: "Kemarin, 14:30", color: "bg-[#DE7272] text-white" },
              { name: "Ustadz Umar", action: "menyelesaikan evaluasi", target: "Kelas 6A", time: "Kemarin, 10:15", color: "bg-[#FFF6A9]" }
            ].map((item, i) => (
              <div key={i} className="px-5 py-4 flex items-start gap-4 hover:bg-[#FFF6A9]/10 dark:hover:bg-zinc-800/50 transition-colors group">
                <div className={`w-8 h-8 ${item.color} flex items-center justify-center flex-shrink-0 mt-0.5 border border-zinc-200/50`}>
                  <span className={`text-xs font-bold ${item.color.includes('text-white') ? 'text-white' : 'text-zinc-800'}`}>{item.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-zinc-800 dark:text-zinc-200">
                    <span className="font-semibold">{item.name}</span> {item.action} <span className="font-medium text-zinc-900 dark:text-white">{item.target}</span>
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">{item.time}</p>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-[#DE7272] hover:bg-[#DE7272] hover:text-white">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col">
          <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">Aksi Cepat</h2>
          </div>
          <div className="p-5 flex-1 flex flex-col gap-3">
            <button className="w-full flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 hover:border-[#DE7272] bg-[#FFF6A9]/10 hover:bg-[#FFF6A9]/30 transition-all group">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-[#DE7272]">Tambah Siswa Baru</span>
              <span className="text-zinc-400 group-hover:text-[#DE7272] font-mono">+</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 hover:border-[#DE7272] bg-[#FFF6A9]/10 hover:bg-[#FFF6A9]/30 transition-all group">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-[#DE7272]">Cetak Raport Kelas</span>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-[#DE7272]" />
            </button>
            <button className="w-full flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 hover:border-[#DE7272] bg-[#FFF6A9]/10 hover:bg-[#FFF6A9]/30 transition-all group">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-[#DE7272]">Pengaturan Tahun Ajaran</span>
              <SettingsIcon className="w-4 h-4 text-zinc-400 group-hover:text-[#DE7272]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  trend,
  trendUp,
  icon,
  iconBg,
  className = ""
}: {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: React.ReactNode;
  iconBg: string;
  className?: string;
}) {
  return (
    <div className={`bg-white dark:bg-zinc-900 p-5 border border-zinc-200 dark:border-zinc-800 flex flex-col relative overflow-hidden group hover:border-[#B4E4D6] dark:hover:border-[#B4E4D6] transition-colors ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold tracking-wider mb-1">{title}</h3>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-2 ${iconBg} border border-black/5`}>
          {icon}
        </div>
      </div>
      <div>
        <p className={`text-xs font-medium flex items-center gap-1 ${trendUp ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-500 dark:text-zinc-500'}`}>
          <span className={`inline-block w-1.5 h-1.5 ${trendUp ? 'bg-[#B4E4D6]' : 'bg-[#DE7272]'}`}></span>
          {trend}
        </p>
      </div>
    </div>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
