'use client';

import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardRedirect() {
  const router = useRouter();
  useEffect(() => {
    const role = Cookies.get('role');
    if (role === 'Admin') router.replace('/admin/app-dashboard');
    else if (role === 'SuperAdmin') router.replace('/super-admin/app-dashboard');
    else if (role === 'Employee') router.replace('/employee/app-dashboard');
    // else if (role === 'HrAdmin') router.replace('/super-admin');
    else if (role === 'Hr') router.replace('/hr');
    else router.replace('/employee');
  }, [router]);
  return <p>Redirecting...</p>;
}
