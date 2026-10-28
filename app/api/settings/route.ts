import { NextResponse } from 'next/server';
import { getSettingsCollection } from '@/lib/mongodb';

const defaultSettings = {
  id: 'system_settings',
  lembaga: {
    nama: "Muharrik Pesantren Ilmu Al-Qur'an",
    nsm: "510035070001",
    npsn: "69987654",
    alamat: "Jl. Pesantren Luhur No. 99, Wonokromo, Surabaya, Jawa Timur 60241",
    mudir: "KH. Muhammad Zaki Al-Hafidz, Lc., M.A.",
    kotaTitimangsa: "Surabaya",
  },
  akademik: {
    tahunAjaran: "2026/2027",
    semester: "Ganjil",
    tanggalCetak: "2026-10-24",
    aksesGuru: "Dibuka",
  },
  penilaian: {
    kriteria: [
      { id: '1', title: 'Makhorijul Huruf', bobot: '20%', desc: 'Ketepatan tempat keluarnya huruf hijaiyah' },
      { id: '2', title: 'Shifatul Huruf', bobot: '20%', desc: "Hams, Jahr, Qolqolah, Isti'la, dll" },
      { id: '3', title: 'Ahkamul Huruf', bobot: '15%', desc: 'Idzhar, Idgham, Ikhfa, Iqlab' },
      { id: '4', title: 'Ahkamul Mad wal Qashr', bobot: '15%', desc: "Kadar panjang mad thobi'i & mad far'i" },
      { id: '5', title: 'Ahkamul Waqf wal Ibtida', bobot: '15%', desc: 'Ketepatan tempat berhenti & memulai bacaan' },
      { id: '6', title: 'Kelancaran (Fashahah)', bobot: '15%', desc: 'Irama murottal, intonasi, & kelancaran lafadz' },
    ],
  },
  updatedAt: new Date(),
};

export async function GET() {
  try {
    const col = await getSettingsCollection();
    const doc = await col.findOne({ id: 'system_settings' });
    
    if (!doc) {
      return NextResponse.json({ success: true, data: defaultSettings, source: 'default' });
    }

    return NextResponse.json({ success: true, data: doc, source: 'mongodb' });
  } catch (error: any) {
    console.warn('MongoDB GET Settings error:', error?.message);
    return NextResponse.json({ success: true, data: defaultSettings, source: 'fallback' });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const col = await getSettingsCollection();
    
    await col.updateOne(
      { id: 'system_settings' },
      { 
        $set: { 
          lembaga: body.lembaga,
          akademik: body.akademik,
          penilaian: body.penilaian || defaultSettings.penilaian,
          updatedAt: new Date(),
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'Pengaturan berhasil disimpan di MongoDB', source: 'mongodb' });
  } catch (error: any) {
    console.error('MongoDB POST Settings error:', error?.message);
    return NextResponse.json({ success: false, error: error?.message || 'Gagal menyimpan pengaturan' }, { status: 500 });
  }
}
