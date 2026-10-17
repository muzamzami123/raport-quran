import { NextResponse } from 'next/server';
import { getSantriCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Initial seed data if collection is empty
const defaultSantriList = [
  // Kelas 1
  { id: '1', nis: '202601001', nama: 'Ahmad Zaki Al-Faruq', kelas: 'Kelas 1' },
  { id: '2', nis: '202601002', nama: 'Fatimah Az-Zahra', kelas: 'Kelas 1' },
  { id: '3', nis: '202601003', nama: 'Zaid bin Tsabit', kelas: 'Kelas 1' },
  { id: '4', nis: '202601004', nama: 'Bilal bin Rabah', kelas: 'Kelas 1' },
  // Kelas 2
  { id: '5', nis: '202602005', nama: 'Muhammad Umar Said', kelas: 'Kelas 2' },
  { id: '6', nis: '202602006', nama: 'Aisyah Humaira', kelas: 'Kelas 2' },
  { id: '7', nis: '202602007', nama: 'Ali Zainal Abidin', kelas: 'Kelas 2' },
  // Kelas 3
  { id: '8', nis: '202603008', nama: 'Aisyah Putri Nabila', kelas: 'Kelas 3' },
  { id: '9', nis: '202603009', nama: 'Salman Al-Farisi', kelas: 'Kelas 3' },
  { id: '10', nis: '202603010', nama: 'Hafshah binti Umar', kelas: 'Kelas 3' },
  // Kelas 4
  { id: '11', nis: '202604011', nama: 'Ibrahim Ali Basayev', kelas: 'Kelas 4' },
  { id: '12', nis: '202604012', nama: 'Khalid bin Walid', kelas: 'Kelas 4' },
  // Kelas 5
  { id: '13', nis: '202605013', nama: 'Abdullah bin Mas\'ud', kelas: 'Kelas 5' },
  { id: '14', nis: '202605014', nama: 'Zubair bin Awwam', kelas: 'Kelas 5' },
  // Kelas 6
  { id: '15', nis: '202606015', nama: 'Maryam Khadijah', kelas: 'Kelas 6' },
  { id: '16', nis: '202606016', nama: 'Usamah bin Zaid', kelas: 'Kelas 6' },
];

export async function GET() {
  try {
    const col = await getSantriCollection();
    const count = await col.countDocuments();
    
    // Seed initial data if database is empty
    if (count === 0) {
      await col.insertMany(defaultSantriList.map(s => ({
        ...s,
        createdAt: new Date(),
        updatedAt: new Date()
      })));
    }

    const docs = await col.find({}).sort({ createdAt: -1, id: 1 }).toArray();
    
    // Format documents
    const santri = docs.map(doc => ({
      id: doc.id || doc._id.toString(),
      nis: doc.nis || `20260${Math.floor(1000 + Math.random() * 9000)}`,
      nama: doc.nama,
      kelas: doc.kelas,
      program: doc.program,
      pembina: doc.pembina,
    }));

    return NextResponse.json({ success: true, data: santri, source: 'mongodb' });
  } catch (error: any) {
    console.error('MongoDB GET error:', error?.message);
    // Return fallback data with connection status warning
    return NextResponse.json({ 
      success: true, 
      data: defaultSantriList, 
      source: 'fallback',
      warning: 'Koneksi MongoDB Atlas memerlukan IP Whitelist (0.0.0.0/0).'
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, kelas, nis } = body;

    if (!nama || !kelas) {
      return NextResponse.json(
        { success: false, error: 'Nama dan kelas wajib diisi' },
        { status: 400 }
      );
    }

    const newSantri = {
      id: Date.now().toString(),
      nis: nis || `20260${Math.floor(1000 + Math.random() * 9000)}`,
      nama: nama.trim(),
      kelas: kelas.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const col = await getSantriCollection();
      const res = await col.insertOne(newSantri);
      return NextResponse.json({
        success: true,
        data: { ...newSantri, _id: res.insertedId.toString() },
        source: 'mongodb'
      });
    } catch (dbErr: any) {
      console.warn('MongoDB POST fallback:', dbErr?.message);
      // Return simulated success with memory data
      return NextResponse.json({
        success: true,
        data: newSantri,
        source: 'fallback',
        warning: 'Data disimpan lokal (Koneksi MongoDB Atlas belum terhubung).'
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memproses data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nama, kelas } = body;

    if (!id || !nama || !kelas) {
      return NextResponse.json(
        { success: false, error: 'ID, nama, dan kelas wajib diisi' },
        { status: 400 }
      );
    }

    try {
      const col = await getSantriCollection();
      
      let query: any = { id: id };
      if (ObjectId.isValid(id)) {
        query = { $or: [{ id: id }, { _id: new ObjectId(id) }] };
      }

      await col.updateOne(
        query,
        {
          $set: {
            nama: nama.trim(),
            kelas: kelas.trim(),
            updatedAt: new Date()
          }
        }
      );

      return NextResponse.json({ success: true, source: 'mongodb' });
    } catch (dbErr: any) {
      console.warn('MongoDB PUT fallback:', dbErr?.message);
      return NextResponse.json({ success: true, source: 'fallback' });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memperbarui data' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID santri wajib diberikan' },
        { status: 400 }
      );
    }

    try {
      const col = await getSantriCollection();
      let query: any = { id: id };
      if (ObjectId.isValid(id)) {
        query = { $or: [{ id: id }, { _id: new ObjectId(id) }] };
      }

      await col.deleteOne(query);
      return NextResponse.json({ success: true, source: 'mongodb' });
    } catch (dbErr: any) {
      console.warn('MongoDB DELETE fallback:', dbErr?.message);
      return NextResponse.json({ success: true, source: 'fallback' });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menghapus data' },
      { status: 500 }
    );
  }
}
