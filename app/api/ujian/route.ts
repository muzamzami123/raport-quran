import { NextResponse } from 'next/server';
import { getUjianCollection } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const examId = searchParams.get('examId');

    const col = await getUjianCollection();
    const query: Record<string, any> = {};
    if (classId) query.classId = classId;
    if (examId) query.examId = examId;

    const docs = await col.find(query).sort({ updatedAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      data: docs.map(d => ({
        id: d.id || d._id.toString(),
        classId: d.classId,
        examId: d.examId,
        namaUjian: d.namaUjian,
        tanggalUjian: d.tanggalUjian,
        santriId: d.santriId,
        nis: d.nis,
        nama: d.nama,
        status: d.status,
        surahDibaca: d.surahDibaca,
        totalKesalahan: d.totalKesalahan,
        nilai: d.nilai,
        predikat: d.predikat,
        catatanGuru: d.catatanGuru,
        errors: d.errors,
        updatedAt: d.updatedAt,
      })),
      source: 'mongodb',
    });
  } catch (error: any) {
    console.warn('MongoDB GET Ujian error:', error?.message);
    return NextResponse.json({ success: false, error: error?.message, data: [], source: 'fallback' });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const col = await getUjianCollection();

    // Body can be a single evaluation or a bulk evaluation update
    const { 
      classId, 
      examId, 
      namaUjian, 
      tanggalUjian, 
      santriId, 
      nis, 
      nama, 
      status, 
      surahDibaca, 
      totalKesalahan, 
      nilai, 
      predikat, 
      catatanGuru, 
      errors 
    } = body;

    if (!classId || !examId || !santriId) {
      return NextResponse.json({ success: false, error: 'classId, examId, dan santriId wajib diisi' }, { status: 400 });
    }

    const evaluationDoc = {
      id: `${classId}_${examId}_${santriId}`,
      classId,
      examId,
      namaUjian: namaUjian || 'Ujian Tasmi',
      tanggalUjian: tanggalUjian || new Date().toISOString(),
      santriId,
      nis,
      nama,
      status: status || 'Selesai',
      surahDibaca: surahDibaca || '',
      totalKesalahan: Number(totalKesalahan) || 0,
      nilai: Number(nilai) || 0,
      predikat: predikat || '',
      catatanGuru: catatanGuru || '',
      errors: errors || { makhorij: 0, shifat: 0, mad: 0, nunMim: 0, waqaf: 0, lahnJali: 0 },
      updatedAt: new Date(),
    };

    await col.updateOne(
      { classId, examId, santriId },
      { $set: evaluationDoc, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Evaluasi berhasil disimpan ke MongoDB Compass',
      data: evaluationDoc,
      source: 'mongodb',
    });
  } catch (error: any) {
    console.error('MongoDB POST Ujian error:', error?.message);
    return NextResponse.json({ success: false, error: error?.message || 'Gagal menyimpan evaluasi' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { classId, examId, namaUjian, tanggalUjian } = body;

    if (!classId || !examId) {
      return NextResponse.json({ success: false, error: 'classId dan examId wajib diisi' }, { status: 400 });
    }

    const col = await getUjianCollection();
    const updateFields: any = { updatedAt: new Date() };
    if (typeof namaUjian === 'string' && namaUjian.trim()) {
      updateFields.namaUjian = namaUjian.trim();
    }
    if (typeof tanggalUjian === 'string' && tanggalUjian.trim()) {
      updateFields.tanggalUjian = tanggalUjian.trim();
    }

    await col.updateMany({ classId, examId }, { $set: updateFields });

    return NextResponse.json({
      success: true,
      message: 'Nama dan jadwal ujian berhasil diperbarui',
      source: 'mongodb',
    });
  } catch (error: any) {
    console.error('MongoDB PUT Ujian error:', error?.message);
    return NextResponse.json({ success: false, error: error?.message || 'Gagal memperbarui ujian' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const examId = searchParams.get('examId');

    if (!classId || !examId) {
      return NextResponse.json({ success: false, error: 'classId dan examId wajib disertakan' }, { status: 400 });
    }

    const col = await getUjianCollection();
    await col.deleteMany({ classId, examId });

    return NextResponse.json({
      success: true,
      message: 'Data evaluasi ujian berhasil dihapus',
      source: 'mongodb',
    });
  } catch (error: any) {
    console.error('MongoDB DELETE Ujian error:', error?.message);
    return NextResponse.json({ success: false, error: error?.message || 'Gagal menghapus ujian' }, { status: 500 });
  }
}
