import { cookies } from 'next/headers';

export default function MePage() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  const role = cookieStore.get('role')?.value;
  const name = cookieStore.get('name')?.value;

  if (!token) {
    return (
      <div className="card">
        <h1 className="text-xl font-semibold mb-4">Current User</h1>
        <p className="text-gray-600">⚠️ No user is logged in.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h1 className="text-xl font-semibold mb-4">Current User</h1>
      <ul className="space-y-2">
        <li><strong>Name:</strong> {name}</li>
        <li><strong>Role:</strong> {role}</li>
        <li><strong>Token:</strong> <code className="break-all">{token}</code></li>
      </ul>
    </div>
  );
}
