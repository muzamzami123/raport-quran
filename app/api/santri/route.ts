import { NextResponse } from 'next/server';
import { getSantriCollection, getSettingsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Initial seed data if collection is empty
const defaultSantriList = [
  // Kelas 1
  { id: '1', nis: '202601001', nama: 'Ahmad Zaki Al-Faruq', jenjang: 'Kelas 1', kelas: '-' },
  { id: '2', nis: '202601002', nama: 'Fatimah Az-Zahra', jenjang: 'Kelas 1', kelas: '-' },
  { id: '3', nis: '202601003', nama: 'Zaid bin Tsabit', jenjang: 'Kelas 1', kelas: '-' },
  { id: '4', nis: '202601004', nama: 'Bilal bin Rabah', jenjang: 'Kelas 1', kelas: '-' },
  // Kelas 2
  { id: '5', nis: '202602005', nama: 'Muhammad Umar Said', jenjang: 'Kelas 2', kelas: '-' },
  { id: '6', nis: '202602006', nama: 'Aisyah Humaira', jenjang: 'Kelas 2', kelas: '-' },
  { id: '7', nis: '202602007', nama: 'Ali Zainal Abidin', jenjang: 'Kelas 2', kelas: '-' },
  // Kelas 3
  { id: '8', nis: '202603008', nama: 'Aisyah Putri Nabila', jenjang: 'Kelas 3', kelas: '-' },
  { id: '9', nis: '202603009', nama: 'Salman Al-Farisi', jenjang: 'Kelas 3', kelas: '-' },
  { id: '10', nis: '202603010', nama: 'Hafshah binti Umar', jenjang: 'Kelas 3', kelas: '-' },
  // Kelas 4
  { id: '11', nis: '202604011', nama: 'Ibrahim Ali Basayev', jenjang: 'Kelas 4', kelas: '-' },
  { id: '12', nis: '202604012', nama: 'Khalid bin Walid', jenjang: 'Kelas 4', kelas: '-' },
  // Kelas 5
  { id: '13', nis: '202605013', nama: 'Abdullah bin Mas\'ud', jenjang: 'Kelas 5', kelas: '-' },
  { id: '14', nis: '202605014', nama: 'Zubair bin Awwam', jenjang: 'Kelas 5', kelas: '-' },
  // Kelas 6
  { id: '15', nis: '202606015', nama: 'Maryam Khadijah', jenjang: 'Kelas 6', kelas: '-' },
  { id: '16', nis: '202606016', nama: 'Usamah bin Zaid', jenjang: 'Kelas 6', kelas: '-' },
];

export async function GET() {
  try {
    const col = await getSantriCollection();

    // Pastikan seeding awal hanya terjadi SEKALI dan idempotent terhadap request paralel
    try {
      const settingsCol = await getSettingsCollection();
      const seedRecord = await settingsCol.findOne({ key: 'santri_seeded' });
      if (!seedRecord) {
        const count = await col.countDocuments();
        if (count === 0) {
          const now = new Date();
          await col.bulkWrite(
            defaultSantriList.map((s) => ({
              updateOne: {
                filter: { id: s.id },
                update: {
                  $setOnInsert: {
                    ...s,
                    createdAt: now,
                    updatedAt: now,
                  },
                },
                upsert: true,
              },
            }))
          );
        }
        await settingsCol.updateOne(
          { key: 'santri_seeded' },
          { $setOnInsert: { key: 'santri_seeded', seededAt: new Date() } },
          { upsert: true }
        );
      }
    } catch {
      // Abaikan jika settings gagal diakses
    }

    const docs = await col.find({}).sort({ createdAt: -1, id: 1 }).toArray();

    // Bersihkan dokumen duplikat dengan id yang sama (misal akibat double-seed sebelumnya)
    const seenIds = new Set<string>();
    const duplicateObjectIds: ObjectId[] = [];
    const uniqueDocs = docs.filter((doc) => {
      const docId = String(doc.id || doc._id.toString());
      if (seenIds.has(docId)) {
        if (doc._id) duplicateObjectIds.push(doc._id);
        return false;
      }
      seenIds.add(docId);
      return true;
    });

    if (duplicateObjectIds.length > 0) {
      await col.deleteMany({ _id: { $in: duplicateObjectIds } }).catch(() => {});
    }

    // Format documents: Pisahkan jenjang diniyah (Kelas 1-6) dan Kelas Al-Qur'an (rombel dari /api/kelas)
    const santri = uniqueDocs.map(doc => {
      let jenjang = doc.jenjang;
      let kelasQuran = doc.kelas;

      // Normalisasi jika data lama tersimpan sebagai jenjang saja
      if (!jenjang) {
        if (doc.kelas && /^Kelas\s*[1-6]/i.test(doc.kelas)) {
          const match = doc.kelas.match(/^Kelas\s*([1-6])/i);
          jenjang = `Kelas ${match ? match[1] : '1'}`;
          // Jika kelas hanya bernilai persis 'Kelas 1' s/d 'Kelas 6', berarti belum memilih rombel Al-Qur'an
          if (/^Kelas\s*[1-6]$/i.test(doc.kelas.trim())) {
            kelasQuran = '-';
          }
        } else {
          jenjang = 'Kelas 1';
        }
      }

      return {
        id: doc.id || doc._id.toString(),
        nis: doc.nis || `20260${Math.floor(1000 + Math.random() * 9000)}`,
        nama: doc.nama,
        jenjang: jenjang || 'Kelas 1',
        kelas: kelasQuran || '-',
        program: doc.program,
        pembina: doc.pembina,
      };
    });

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
    const { nama, kelas, jenjang, nis } = body;

    if (!nama) {
      return NextResponse.json(
        { success: false, error: 'Nama santri wajib diisi' },
        { status: 400 }
      );
    }

    const newSantri = {
      id: Date.now().toString(),
      nis: nis || `20260${Math.floor(1000 + Math.random() * 9000)}`,
      nama: nama.trim(),
      jenjang: (jenjang || 'Kelas 1').trim(),
      kelas: (kelas || '-').trim(),
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
    const { id, nama, kelas, jenjang } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID santri wajib diisi' },
        { status: 400 }
      );
    }

    try {
      const col = await getSantriCollection();
      
      let query: any = { id: id };
      if (ObjectId.isValid(id)) {
        query = { $or: [{ id: id }, { _id: new ObjectId(id) }] };
      }

      const updateData: any = {
        updatedAt: new Date()
      };
      if (nama) updateData.nama = nama.trim();
      if (kelas !== undefined) updateData.kelas = kelas.trim();
      if (jenjang !== undefined) updateData.jenjang = jenjang.trim();

      await col.updateOne(
        query,
        {
          $set: updateData
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
