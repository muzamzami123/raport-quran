import { NextResponse } from 'next/server';
import { getKelasCollection, getGuruCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const col = await getKelasCollection();
    const docs = await col.find({}).toArray();
    const seenIds = new Set<string>();
    const duplicateObjectIds: ObjectId[] = [];
    const uniqueDocs = docs.filter((d) => {
      const docId = String(d.id || d._id.toString());
      if (seenIds.has(docId)) {
        if (d._id) duplicateObjectIds.push(d._id);
        return false;
      }
      seenIds.add(docId);
      return true;
    });
    if (duplicateObjectIds.length > 0) {
      await col.deleteMany({ _id: { $in: duplicateObjectIds } }).catch(() => {});
    }

    // Ambil daftar guru aktif dari database untuk menyinkronkan nama guru di kelas
    let activeGuruNames: string[] = [];
    try {
      const guruCol = await getGuruCollection();
      const guruDocs = await guruCol.find({}).toArray();
      activeGuruNames = guruDocs.map((g) => (g.name || '').trim()).filter(Boolean);
    } catch {
      // Abaikan jika guru gagal diakses
    }

    // Sinkronkan nama guru pada kelas jika ada nama lama (misal "Ust Arif" yang diubah jadi "Ust Rendra")
    if (activeGuruNames.length > 0) {
      for (const d of uniqueDocs) {
        let hasChanges = false;
        let waliList: string[] = Array.isArray(d.waliList) && d.waliList.length > 0
          ? [...d.waliList]
          : typeof d.wali === 'string' && d.wali && d.wali !== '-'
          ? d.wali.split(/\s*[|•]\s*/).map((w: string) => w.trim()).filter(Boolean)
          : [];

        if (waliList.length > 0) {
          const updatedList = waliList
            .map((w) => {
              if (activeGuruNames.includes(w)) return w;

              // Jika nama lama mengandung "arif" dan ada guru baru mengandung "rendra"
              if (w.toLowerCase().includes('arif')) {
                const rendraGuru = activeGuruNames.find((g) => g.toLowerCase().includes('rendra'));
                if (rendraGuru) {
                  hasChanges = true;
                  return rendraGuru;
                }
              }

              // Cari kecocokan parsial dengan guru aktif
              const partial = activeGuruNames.find(
                (g) => g.toLowerCase().includes(w.toLowerCase()) || w.toLowerCase().includes(g.toLowerCase())
              );
              if (partial) {
                hasChanges = true;
                return partial;
              }

              // Guru tidak lagi terdaftar
              hasChanges = true;
              return null;
            })
            .filter((w): w is string => Boolean(w));

          const finalUniqueList = Array.from(new Set(updatedList));

          if (hasChanges) {
            d.waliList = finalUniqueList;
            d.wali = finalUniqueList.join(' | ');
            try {
              if (d._id) {
                await col.updateOne(
                  { _id: d._id },
                  { $set: { wali: d.wali, waliList: d.waliList, updatedAt: new Date() } }
                );
              }
            } catch {
              // ignore
            }
          }
        }
      }
    }

    const data = uniqueDocs.map(d => ({
      id: d.id || d._id.toString(),
      kode: d.kode,
      nama: d.nama,
      program: d.program,
      wali: d.wali,
      waliList: Array.isArray(d.waliList) ? d.waliList : undefined,
      materiTerakhir: d.materiTerakhir || '',
      ujianSessions: Array.isArray(d.ujianSessions) ? d.ujianSessions : undefined,
      jumlah: d.jumlah,
      kapasitas: d.kapasitas,
      ruangan: d.ruangan,
      status: d.status,
    }));
    return NextResponse.json({ success: true, data, source: 'mongodb' });
  } catch (err: any) {
    console.error('MongoDB GET Kelas error:', err?.message);
    return NextResponse.json({ success: false, data: [], error: err?.message, source: 'mongodb' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const waliList = Array.isArray(body.waliList)
      ? body.waliList.filter(Boolean)
      : body.wali
      ? [body.wali]
      : [];
    const newKelas = {
      id: Date.now().toString(),
      kode: body.kode,
      nama: body.nama?.trim(),
      program: body.program,
      wali: body.wali || waliList.join(' | '),
      waliList,
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
    } catch (dbErr: any) {
      console.error('MongoDB POST Kelas error:', dbErr?.message);
      return NextResponse.json({ success: false, error: dbErr?.message || 'Gagal menyimpan kelas ke database' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nama, wali, waliList, program, kapasitas, ruangan, status, materiTerakhir, ujianSessions } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID Kelas wajib diisi' }, { status: 400 });
    }

    try {
      const col = await getKelasCollection();
      const orConditions: any[] = [{ id: id }, { id: String(id) }];
      if (!isNaN(Number(id))) orConditions.push({ id: Number(id) });
      if (/^[0-9a-fA-F]{24}$/.test(id)) orConditions.push({ _id: new ObjectId(id) });

      const updateData: any = {
        updatedAt: new Date(),
      };
      if (typeof nama === 'string' && nama.trim()) updateData.nama = nama.trim();
      if (typeof wali === 'string') {
        updateData.wali = wali.trim();
      } else if (Array.isArray(waliList)) {
        updateData.wali = waliList.join(' | ');
      }
      if (Array.isArray(waliList)) updateData.waliList = waliList;
      if (program) updateData.program = program;
      if (kapasitas) updateData.kapasitas = Number(kapasitas);
      if (ruangan) updateData.ruangan = ruangan;
      if (status) updateData.status = status;
      if (typeof materiTerakhir === 'string') updateData.materiTerakhir = materiTerakhir.trim();
      if (Array.isArray(ujianSessions)) updateData.ujianSessions = ujianSessions;

      await col.updateOne({ $or: orConditions }, { $set: updateData });
      return NextResponse.json({ success: true, source: 'mongodb' });
    } catch (dbErr: any) {
      console.error('MongoDB PUT Kelas error:', dbErr?.message);
      return NextResponse.json({ success: false, error: dbErr?.message || 'Gagal memperbarui kelas di database' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const nama = searchParams.get('nama');
    if (!id && !nama) return NextResponse.json({ success: false, error: 'ID atau nama wajib disertakan' }, { status: 400 });

    try {
      const col = await getKelasCollection();
      const orConditions: any[] = [];
      if (id) {
        orConditions.push({ id });
        orConditions.push({ id: String(id) });
        if (!isNaN(Number(id))) orConditions.push({ id: Number(id) });
        if (/^[0-9a-fA-F]{24}$/.test(id)) orConditions.push({ _id: new ObjectId(id) });
      }
      if (nama) {
        const cleanName = nama.trim();
        orConditions.push({ nama: cleanName });
        const escaped = cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        orConditions.push({ nama: { $regex: new RegExp(`^${escaped}$`, 'i') } });
      }

      const res = await col.deleteOne({ $or: orConditions });

      if (res.deletedCount === 0) {
        return NextResponse.json({ 
          success: false, 
          deletedCount: 0, 
          error: 'Data kelas tidak ditemukan di database MongoDB.' 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        deletedCount: res.deletedCount, 
        source: 'mongodb' 
      });
    } catch (dbErr: any) {
      console.error('MongoDB DELETE Kelas error:', dbErr?.message);
      return NextResponse.json({ success: false, error: dbErr?.message || 'Gagal menghapus kelas' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
