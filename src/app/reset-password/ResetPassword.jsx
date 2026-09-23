'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const emailFromQuery = params.get('email'); // get email from query

  if (!emailFromQuery) {
    // Redirect back if email is missing
    if (typeof window !== 'undefined') router.push('/signin');
    return null;
  }

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState('enterCode'); // enterCode or setPassword
  const [loading, setLoading] = useState(false);

  const verifyCode = async () => {
    if (!code) return alert('Enter the reset code');
    setLoading(true);
    try {
      const res = await fetch(`https://code360.pro/api/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailFromQuery, code }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || 'Invalid code');
      setStep('setPassword');
    } catch {
      alert('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!code || !newPassword) return alert('All fields are required');
    setLoading(true);
    try {
      const res = await fetch(`https://code360.pro/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailFromQuery, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || 'Failed to reset password');
      alert('Password reset successfully! You can now sign in.');
      router.push('/signin');
    } catch {
      alert('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <Lock className="w-14 h-14 text-blue-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
            <p className="text-gray-600 text-sm">
              Resetting password for <b>{emailFromQuery}</b>
            </p>
          </div>

          <div className="space-y-4">
            {step === 'enterCode' ? (
              <>
                <Input
                  type="text"
                  placeholder="Enter 6-digit reset code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
                <Button
                  onClick={verifyCode}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-600"
                  disabled={loading || code.length !== 6}
                >
                  {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto" /> : 'Verify Code'}
                </Button>
              </>
            ) : (
              <>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  onClick={resetPassword}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
                  disabled={loading || !newPassword}
                >
                  {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto" /> : 'Reset Password'}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
