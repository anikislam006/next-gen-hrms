'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { supabase } from '@/utils/supabaseClient';

// Supabase's own confirmation email links back here with the verification
// result already applied; the client library picks up the resulting
// session from the URL automatically. No separate code-entry step needed.
export default function VerifyPage() {
  const router = useRouter();
  const [status, setStatus] = useState('checking'); // checking | verified | failed

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setStatus('verified');
        setTimeout(() => router.push('/signin'), 2500);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setStatus('verified');
        setTimeout(() => router.push('/signin'), 2500);
      } else {
        setStatus('failed');
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
        <CardContent className="p-8 text-center">
          {status === 'checking' && (
            <>
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold mb-2">Confirming your email...</h1>
            </>
          )}
          {status === 'verified' && (
            <>
              <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Email Verified</h1>
              <p className="text-gray-600 text-sm mb-6">
                Your account is active. Redirecting you to sign in...
              </p>
              <Button onClick={() => router.push('/signin')} className="w-full">
                Go to Sign In
              </Button>
            </>
          )}
          {status === 'failed' && (
            <>
              <XCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Link Invalid or Expired</h1>
              <p className="text-gray-600 text-sm mb-6">
                Please sign up again or contact your administrator.
              </p>
              <Button onClick={() => router.push('/signin')} className="w-full">
                Back to Sign In
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
