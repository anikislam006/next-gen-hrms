'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

export default function VerifyPage() {
  const params = useSearchParams();
  const router = useRouter();
  const userId = params.get('userId');
  const email = params.get('email');

  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  const verify = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://code360.pro/api/verify-email-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Error verifying code');
        return;
      }
      alert('Email verified successfully! You can now sign in.');
      router.push('/signin');
    } catch (err) {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setCooldown(30);
    await fetch(`https://code360.pro/api/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
            <p className="text-gray-600 text-sm">
              We sent a verification code to <b>{email}</b>
            </p>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              maxLength={6}
              onChange={(e) => setCode(e.target.value)}
              className="text-center text-lg tracking-widest"
            />

            <Button
              onClick={verify}
              disabled={code.length !== 6 || loading}
              className="w-full bg-gradient-to-r from-green-500 to-teal-600"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto" />
              ) : (
                'Verify Email'
              )}
            </Button>

            <Button
              onClick={resend}
              disabled={cooldown > 0}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
