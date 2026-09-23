import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  const role = cookieStore.get('role')?.value;
  const name = cookieStore.get('name')?.value;

  if (!token) {
    return NextResponse.json(null, { status: 200 });
  }

  return NextResponse.json({ token, role, name });
}
