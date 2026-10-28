import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Berhasil logout' });
  response.cookies.set('admin_session', '', {
    path: '/',
    maxAge: 0,
  });
  return response;
}

export async function GET(request: Request) {
  const url = new URL('/login', request.url);
  const response = NextResponse.redirect(url);
  response.cookies.set('admin_session', '', {
    path: '/',
    maxAge: 0,
  });
  return response;
}

