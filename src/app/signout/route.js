import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.redirect(new URL('/', 'http://localhost:3000'));
  res.cookies.set('token', '', { maxAge: 0 });
  res.cookies.set('role', '', { maxAge: 0 });
  res.cookies.set('name', '', { maxAge: 0 });
  return res;
}
