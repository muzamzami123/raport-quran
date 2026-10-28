import { NextResponse } from 'next/server';
import { getGuruCollection, getSettingsCollection, getKelasCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const defaultGuru = [
  { id: '1', nip: "G-001", name: "Ustadz Ahmad, S.Pd.I", bidang: "Tahfidz & Murojaah", wali: "Kelas 1A & 5A", kontak: "+62 812-3456-7890", status: "Aktif" },
  { id: '2', nip: "G-002", name: "Ustadzah Fatimah, Lc", bidang: "Tafsir & Hadits", wali: "Kelas 1B & 6B", kontak: "+62 813-4567-8901", status: "Aktif" },
  { id: '3', nip: "G-003", name: "Ustadz Umar", bidang: "Tajwid & Makhorijul Huruf", wali: "Kelas 2A & 4A", kontak: "+62 814-5678-9012", status: "Aktif" },
  { id: '4', nip: "G-004", name: "Ustadzah Maryam, M.Ag", bidang: "Murojaah & Fiqih Ibadah", wali: "Kelas 3A", kontak: "+62 815-6789-0123", status: "Aktif" },
  { id: '5', nip: "G-005", name: "Ustadz Zulkifli, S.Th.I", bidang: "Tahfidz & Aqidah Akhlak", wali: "Kelas 5B", kontak: "+62 816-7890-1234", status: "Aktif" },
  { id: '6', nip: "G-006", name: "Ustadz Hasan Basri", bidang: "Tafsir Al-Qur'an & Tahsin", wali: "Kelas 6A", kontak: "+62 817-8901-2345", status: "Aktif" },
];

export async function GET(request: Request) {
  try {
    const col = await getGuruCollection();
    
    // Pastikan seeding awal hanya terjadi SEKALI seumur hidup database
    try {
      const settingsCol = await getSettingsCollection();
      const seedRecord = await settingsCol.findOne({ key: 'guru_seeded' });
      if (!seedRecord) {
        const count = await col.countDocuments();
        if (count === 0) {
          await col.insertMany(defaultGuru.map(g => ({ ...g, createdAt: new Date() })));
        }
        await settingsCol.insertOne({ key: 'guru_seeded', seededAt: new Date() });
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

    const data = uniqueDocs.map(d => ({
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
      name: body.name?.trim(),
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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, wali, nip, bidang, kontak, status, oldName } = body;

    if (!id || !name) {
      return NextResponse.json({ success: false, error: 'ID dan Nama wajib diisi' }, { status: 400 });
    }

    try {
      const col = await getGuruCollection();
      const orConditions: any[] = [{ id: id }, { id: String(id) }];
      if (!isNaN(Number(id))) orConditions.push({ id: Number(id) });
      if (/^[0-9a-fA-F]{24}$/.test(id)) orConditions.push({ _id: new ObjectId(id) });

      // Dapatkan nama lama sebelum di-update untuk menyinkronkan nama guru di kelas
      const existingGuru = await col.findOne({ $or: orConditions });
      const previousName = (oldName || existingGuru?.name || '').trim();
      const newName = name.trim();

      const updateData: any = {
        name: newName,
        wali: wali ? wali.trim() : '',
        updatedAt: new Date(),
      };
      if (nip) updateData.nip = nip;
      if (bidang) updateData.bidang = bidang;
      if (kontak) updateData.kontak = kontak;
      if (status) updateData.status = status;

      await col.updateOne({ $or: orConditions }, { $set: updateData });

      // Sinkronkan nama guru pada seluruh kelas yang diampu jika ada perubahan nama
      if (previousName && previousName !== newName) {
        try {
          const kelasCol = await getKelasCollection();
          const allKelas = await kelasCol.find({}).toArray();

          for (const k of allKelas) {
            let needsUpdate = false;
            let nextWaliList: string[] = Array.isArray(k.waliList) ? [...k.waliList] : [];
            let nextWali: string = k.wali || '';

            // Cek di array waliList
            if (nextWaliList.length > 0) {
              const matched = nextWaliList.some(
                (w) => w.trim().toLowerCase() === previousName.toLowerCase()
              );
              if (matched) {
                nextWaliList = nextWaliList.map((w) =>
                  w.trim().toLowerCase() === previousName.toLowerCase() ? newName : w
                );
                nextWali = nextWaliList.join(' | ');
                needsUpdate = true;
              }
            }

            // Cek di string wali jika belum terupdate
            if (!needsUpdate && nextWali) {
              const parts = nextWali.split(/\s*[|•]\s*/).map((p) => p.trim());
              const matchedPart = parts.some(
                (p) => p.toLowerCase() === previousName.toLowerCase()
              );
              if (matchedPart) {
                const updatedParts = parts.map((p) =>
                  p.toLowerCase() === previousName.toLowerCase() ? newName : p
                );
                nextWali = updatedParts.join(' | ');
                nextWaliList = updatedParts;
                needsUpdate = true;
              } else if (nextWali.toLowerCase().includes(previousName.toLowerCase())) {
                const escaped = previousName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                nextWali = nextWali.replace(new RegExp(escaped, 'gi'), newName);
                nextWaliList = nextWali.split(/\s*[|•]\s*/).map((p) => p.trim()).filter(Boolean);
                needsUpdate = true;
              }
            }

            if (needsUpdate) {
              await kelasCol.updateOne(
                { _id: k._id },
                { $set: { wali: nextWali, waliList: nextWaliList, updatedAt: new Date() } }
              );
            }
          }
        } catch (syncErr: any) {
          console.warn('Gagal menyinkronkan nama guru ke kelas:', syncErr?.message);
        }
      }

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
    const name = searchParams.get('name');

    if (!id && !name) {
      return NextResponse.json({ success: false, error: 'ID atau Nama wajib disertakan' }, { status: 400 });
    }

    try {
      const col = await getGuruCollection();
      
      const orConditions: any[] = [];
      if (id) {
        orConditions.push({ id: id });
        orConditions.push({ id: String(id) });
        if (!isNaN(Number(id))) {
          orConditions.push({ id: Number(id) });
        }
        orConditions.push({ nip: id });
        if (/^[0-9a-fA-F]{24}$/.test(id)) {
          orConditions.push({ _id: new ObjectId(id) });
        }
      }
      if (name) {
        const cleanName = name.trim();
        orConditions.push({ name: cleanName });
        const escaped = cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        orConditions.push({ name: { $regex: new RegExp(`^${escaped}$`, 'i') } });
      }

      const res = await col.deleteOne({ $or: orConditions });

      if (res.deletedCount === 0) {
        return NextResponse.json({ 
          success: false, 
          deletedCount: 0, 
          error: 'Data guru tidak ditemukan di database MongoDB.' 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        deletedCount: res.deletedCount, 
        source: 'mongodb' 
      });
    } catch (dbErr: any) {
      console.error('MongoDB DELETE Guru error:', dbErr?.message);
      return NextResponse.json({ success: false, error: dbErr?.message || 'Gagal menghapus dari MongoDB' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
