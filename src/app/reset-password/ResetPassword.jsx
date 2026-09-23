'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { supabase } from '@/utils/supabaseClient';

export default function ResetPasswordPage() {
  const router = useRouter();

  // Supabase's password-reset email links back to this page with a recovery
  // token in the URL; the client library reads it automatically and fires
  // a PASSWORD_RECOVERY auth event once the recovery session is ready.
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
        setChecking(false);
      }
    });

    // In case the event already fired before this component mounted,
    // also check for an existing (recovery) session directly.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      setChecking(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const resetPassword = async () => {
    if (!newPassword || !confirmPassword) return alert('Please fill in both fields');
    if (newPassword.length < 6) return alert('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return alert("Passwords don't match");

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        alert(error.message || 'Failed to reset password');
        return;
      }
      setDone(true);
      await supabase.auth.signOut();
      setTimeout(() => router.push('/signin'), 2000);
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
            {done ? (
              <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
            ) : (
              <Lock className="w-14 h-14 text-blue-500 mx-auto mb-4" />
            )}
            <h1 className="text-2xl font-bold mb-2">
              {done ? 'Password Updated' : 'Reset Password'}
            </h1>
            {!done && (
              <p className="text-gray-600 text-sm">
                Choose a new password for your account
              </p>
            )}
          </div>

          {done ? (
            <p className="text-center text-gray-600 text-sm">
              Redirecting you to sign in...
            </p>
          ) : checking ? (
            <p className="text-center text-gray-500 text-sm">Verifying your reset link...</p>
          ) : !ready ? (
            <p className="text-center text-red-600 text-sm">
              This reset link is invalid or has expired. Please request a new one from
              the sign-in page.
            </p>
          ) : (
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                onClick={resetPassword}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
                disabled={loading || !newPassword || !confirmPassword}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto" />
                ) : (
                  'Reset Password'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
