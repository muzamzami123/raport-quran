import { NextResponse } from 'next/server';
import { getGuruCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const defaultGuru = [
  { id: '1', nip: "G-001", name: "Ustadz Ahmad, S.Pd.I", bidang: "Tahfidz & Murojaah", wali: "Kelas 1A & 5A", kontak: "+62 812-3456-7890", status: "Aktif" },
  { id: '2', nip: "G-002", name: "Ustadzah Fatimah, Lc", bidang: "Tafsir & Hadits", wali: "Kelas 1B & 6B", kontak: "+62 813-4567-8901", status: "Aktif" },
  { id: '3', nip: "G-003", name: "Ustadz Umar", bidang: "Tajwid & Makhorijul Huruf", wali: "Kelas 2A & 4A", kontak: "+62 814-5678-9012", status: "Aktif" },
  { id: '4', nip: "G-004", name: "Ustadzah Maryam, M.Ag", bidang: "Murojaah & Fiqih Ibadah", wali: "Kelas 3A", kontak: "+62 815-6789-0123", status: "Aktif" },
  { id: '5', nip: "G-005", name: "Ustadz Zulkifli, S.Th.I", bidang: "Tahfidz & Aqidah Akhlak", wali: "Kelas 5B", kontak: "+62 816-7890-1234", status: "Aktif" },
  { id: '6', nip: "G-006", name: "Ustadz Hasan Basri", bidang: "Tafsir Al-Qur'an & Tahsin", wali: "Kelas 6A", kontak: "+62 817-8901-2345", status: "Aktif" },
];

export async function GET() {
  try {
    const col = await getGuruCollection();
    const count = await col.countDocuments();
    if (count === 0) {
      await col.insertMany(defaultGuru.map(g => ({ ...g, createdAt: new Date() })));
    }
    const docs = await col.find({}).toArray();
    const data = docs.map(d => ({
      id: d.id || d._id.toString(),
      nip: d.nip,
      name: d.name,
      bidang: d.bidang,
      wali: d.wali,
      kontak: d.kontak,
      status: d.status,
    }));
    return NextResponse.json({ success: true, data, source: 'mongodb' });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: defaultGuru, source: 'fallback' });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newGuru = {
      id: Date.now().toString(),
      nip: body.nip,
      name: body.name,
      bidang: body.bidang,
      wali: body.wali,
      kontak: body.kontak,
      status: body.status || 'Aktif',
      createdAt: new Date(),
    };
    try {
      const col = await getGuruCollection();
      await col.insertOne(newGuru);
      return NextResponse.json({ success: true, data: newGuru, source: 'mongodb' });
    } catch {
      return NextResponse.json({ success: true, data: newGuru, source: 'fallback' });
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
      const col = await getGuruCollection();
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
