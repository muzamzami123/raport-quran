import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = (body.identifier || body.email || body.username || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Username atau Email Admin dan Kata Sandi wajib diisi' },
        { status: 400 }
      );
    }

    // Kredensial khusus Administrator
    const isAdminUser =
      identifier === 'admin' ||
      identifier === 'administrator' ||
      identifier === 'admin@pesantrenquran.id' ||
      identifier === 'admin@piq.ac.id' ||
      identifier === 'admin@piq.sch.id' ||
      identifier.startsWith('admin');

    const isValidAdminPassword =
      password === 'admin' ||
      password === 'admin123' ||
      password === '123456' ||
      password === 'bismillah';

    // Verifikasi akses khusus Administrator
    if (isAdminUser && isValidAdminPassword) {
      const response = NextResponse.json({
        success: true,
        message: 'Otentikasi administrator berhasil',
        user: {
          name: 'Administrator Lembaga',
          role: 'admin',
          identifier,
        },
      });

      response.cookies.set('admin_session', 'authenticated_admin', {
        httpOnly: false,
        path: '/',
        maxAge: body.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
        sameSite: 'lax',
      });

      return response;
    }

    // Akses ditolak jika bukan kredensial admin yang sah
    return NextResponse.json(
      {
        success: false,
        error: 'Kredensial administrator tidak valid atau akun tidak memiliki hak akses admin.',
      },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Terjadi kesalahan sistem autentikasi' },
      { status: 500 }
    );
  }
}
