import { NextResponse } from 'next/server';
import { getKelasCollection, getSettingsCollection, getGuruCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const defaultDataKelas = [
  { id: '1', kode: 'HAL-01A', nama: "Kelas 1A", program: "Murottal", wali: "Ustadz Ahmad, S.Pd.I", jumlah: 25, kapasitas: 25, ruangan: "Gedung Ula 101", status: "Aktif" },
  { id: '2', kode: 'HAL-01B', nama: "Kelas 1B", program: "Murojaah", wali: "Ustadzah Fatimah, Lc", jumlah: 24, kapasitas: 25, ruangan: "Gedung Ula 102", status: "Aktif" },
  { id: '3', kode: 'HAL-02A', nama: "Kelas 2A", program: "Murottal", wali: "Ustadz Umar", jumlah: 22, kapasitas: 25, ruangan: "Gedung Wustha 201", status: "Aktif" },
  { id: '4', kode: 'HAL-03A', nama: "Kelas 3A", program: "Murojaah", wali: "Ustadzah Maryam, M.Ag", jumlah: 25, kapasitas: 25, ruangan: "Gedung Wustha 202", status: "Aktif" },
  { id: '5', kode: 'HAL-05A', nama: "Kelas 5A", program: "Murottal", wali: "Ustadz Zulkifli, S.Th.I", jumlah: 25, kapasitas: 25, ruangan: "Gedung Ulya 301", status: "Aktif" },
  { id: '6', kode: 'HAL-06A', nama: "Kelas 6A", program: "Tafsir", wali: "Ustadz Hasan Basri", jumlah: 20, kapasitas: 20, ruangan: "Gedung Ma'had Utama", status: "Aktif" },
];

export async function GET(request: Request) {
  try {
    const col = await getKelasCollection();

    // Pastikan seeding hanya terjadi SEKALI seumur hidup database
    try {
      const settingsCol = await getSettingsCollection();
      const seedRecord = await settingsCol.findOne({ key: 'kelas_seeded' });
      if (!seedRecord) {
        const count = await col.countDocuments();
        if (count === 0) {
          await col.insertMany(defaultDataKelas.map(k => ({ ...k, createdAt: new Date() })));
        }
        await settingsCol.insertOne({ key: 'kelas_seeded', seededAt: new Date() });
      }
    } catch {
      // Abaikan jika settings gagal diakses
    }

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
  } catch {
    return NextResponse.json({ success: true, data: defaultDataKelas, source: 'fallback' });
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
    } catch {
      return NextResponse.json({ success: true, data: newKelas, source: 'fallback' });
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
    } catch {
      return NextResponse.json({ success: true, source: 'fallback' });
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
