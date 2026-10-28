import { NextResponse } from 'next/server';
import { getSantriCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const col = await getSantriCollection();
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
    return NextResponse.json({ 
      success: false, 
      data: [], 
      error: error?.message,
      source: 'mongodb',
    }, { status: 500 });
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
      console.error('MongoDB POST Santri error:', dbErr?.message);
      return NextResponse.json({
        success: false,
        error: dbErr?.message || 'Gagal menyimpan santri ke database',
      }, { status: 500 });
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
      console.error('MongoDB PUT Santri error:', dbErr?.message);
      return NextResponse.json({ success: false, error: dbErr?.message || 'Gagal memperbarui santri di database' }, { status: 500 });
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
      console.error('MongoDB DELETE Santri error:', dbErr?.message);
      return NextResponse.json({ success: false, error: dbErr?.message || 'Gagal menghapus santri dari database' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menghapus data' },
      { status: 500 }
    );
  }
}
