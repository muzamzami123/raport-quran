import { NextResponse } from 'next/server';
import { getGuruCollection, getKelasCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const col = await getGuruCollection();
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
    console.error('MongoDB GET Guru error:', err?.message);
    return NextResponse.json({ success: false, data: [], error: err?.message, source: 'mongodb' }, { status: 500 });
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
    } catch (dbErr: any) {
      console.error('MongoDB POST Guru error:', dbErr?.message);
      return NextResponse.json({ success: false, error: dbErr?.message || 'Gagal menyimpan guru ke database' }, { status: 500 });
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
    } catch (dbErr: any) {
      console.error('MongoDB PUT Guru error:', dbErr?.message);
      return NextResponse.json({ success: false, error: dbErr?.message || 'Gagal memperbarui guru di database' }, { status: 500 });
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
