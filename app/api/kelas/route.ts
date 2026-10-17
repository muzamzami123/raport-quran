import { NextResponse } from 'next/server';
import { getKelasCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const defaultDataKelas = [
  { id: '1', kode: 'HAL-01A', nama: "Kelas 1A", program: "Murottal", wali: "Ustadz Ahmad, S.Pd.I", jumlah: 25, kapasitas: 25, ruangan: "Gedung Ula 101", status: "Aktif" },
  { id: '2', kode: 'HAL-01B', nama: "Kelas 1B", program: "Murojaah", wali: "Ustadzah Fatimah, Lc", jumlah: 24, kapasitas: 25, ruangan: "Gedung Ula 102", status: "Aktif" },
  { id: '3', kode: 'HAL-02A', nama: "Kelas 2A", program: "Murottal", wali: "Ustadz Umar", jumlah: 22, kapasitas: 25, ruangan: "Gedung Wustha 201", status: "Aktif" },
  { id: '4', kode: 'HAL-03A', nama: "Kelas 3A", program: "Murojaah", wali: "Ustadzah Maryam, M.Ag", jumlah: 25, kapasitas: 25, ruangan: "Gedung Wustha 202", status: "Aktif" },
  { id: '5', kode: 'HAL-05A', nama: "Kelas 5A", program: "Murottal", wali: "Ustadz Zulkifli, S.Th.I", jumlah: 25, kapasitas: 25, ruangan: "Gedung Ulya 301", status: "Aktif" },
  { id: '6', kode: 'HAL-06A', nama: "Kelas 6A", program: "Tafsir", wali: "Ustadz Hasan Basri", jumlah: 20, kapasitas: 20, ruangan: "Gedung Ma'had Utama", status: "Aktif" },
];

export async function GET() {
  try {
    const col = await getKelasCollection();
    const count = await col.countDocuments();
    if (count === 0) {
      await col.insertMany(defaultDataKelas.map(k => ({ ...k, createdAt: new Date() })));
    }
    const docs = await col.find({}).toArray();
    const data = docs.map(d => ({
      id: d.id || d._id.toString(),
      kode: d.kode,
      nama: d.nama,
      program: d.program,
      wali: d.wali,
      jumlah: d.jumlah,
      kapasitas: d.kapasitas,
      ruangan: d.ruangan,
      status: d.status,
    }));
    return NextResponse.json({ success: true, data, source: 'mongodb' });
  } catch {
    return NextResponse.json({ success: true, data: defaultDataKelas, source: 'fallback' });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newKelas = {
      id: Date.now().toString(),
      kode: body.kode,
      nama: body.nama,
      program: body.program,
      wali: body.wali,
      jumlah: 0,
      kapasitas: Number(body.kapasitas) || 25,
      ruangan: body.ruangan,
      status: 'Aktif',
      createdAt: new Date(),
    };
    try {
      const col = await getKelasCollection();
      await col.insertOne(newKelas);
      return NextResponse.json({ success: true, data: newKelas, source: 'mongodb' });
    } catch {
      return NextResponse.json({ success: true, data: newKelas, source: 'fallback' });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    try {
      const col = await getKelasCollection();
      let query: any = { id };
      if (ObjectId.isValid(id)) query = { $or: [{ id }, { _id: new ObjectId(id) }] };
      await col.deleteOne(query);
      return NextResponse.json({ success: true, source: 'mongodb' });
    } catch {
      return NextResponse.json({ success: true, source: 'fallback' });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
