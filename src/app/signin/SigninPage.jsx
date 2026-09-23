"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AnimatedBackground from "../../components/Background/AnimatedBackground";
import { motion } from "framer-motion";
import Link from "next/link";
import "../globals.css";
import { useState } from "react";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function SignInPage() {
  const {
    register,
    handleSubmit,
    setValue, // Added to handle auto-fill
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });
  const [lockedMessage, setLockedMessage] = useState(null);

  const { setUser } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const onSubmit = async (data) => {
    try {
      const res = await fetch(`https://code360.pro/api/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.message || "Login failed");
        return;
      }

      if (json.locked) {
        Cookies.set("token", json.token, { expires: 7 });
        Cookies.set("role", json.user.role, { expires: 7 });
        Cookies.set("name", json.user.name, { expires: 7 });
        Cookies.set("email", json.user.email, { expires: 7 });

        setUser({
          token: json.token,
          role: json.user.role,
          name: json.user.name,
          email: json.user.email,
        });

        setLockedMessage(json.message);
        return;
      }

      Cookies.set("token", json.token, { expires: 7 });
      Cookies.set("role", json.user.role, { expires: 7 });
      Cookies.set("name", json.user.name, { expires: 7 });
      Cookies.set("email", json.user.email, { expires: 7 });

      setUser({
        token: json.token,
        role: json.user.role,
        name: json.user.name,
        email: json.user.email,
      });

      router.replace(next);
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  const handleForgotPassword = async (email) => {
    if (!email) return alert("Please enter your email first");

    try {
      const res = await fetch(`https://code360.pro/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      alert(data.message);
      if (res.ok) {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send reset code");
    }
  };

  return (
    <div className="min-h-screen font-inter relative flex items-center justify-center p-4">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-12">
        {/* Main Login Card (Untouched Design) */}
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">🏢</span>
            </div>
            <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
              HR Management System
            </h1>
            <p className="text-gray-600">Sign in to access your dashboard</p>
          </div>

          <Link href="/signup">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mb-6 cursor-pointer"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full cursor-pointer p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xl">🎯</span>
                  <div className="text-center">
                    <div className="font-semibold">New Employee Onboarding</div>
                    <div className="text-sm opacity-90">
                      Test complete profile setup
                    </div>
                  </div>
                  <motion.span whileHover={{ x: 5 }} className="text-xl">
                    ➤
                  </motion.span>
                </div>
              </motion.button>
            </motion.div>
          </Link>

          {lockedMessage && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative my-6 text-center rounded-2xl border border-red-400 bg-gradient-to-br from-red-50 via-red-100 to-red-200 overflow-hidden"
            >
              <motion.div
                animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.02, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.8,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-red-300/30 blur-2xl"
              />
              <div className="relative z-10 p-6 flex flex-col items-center gap-3">
                <p className="text-sm text-red-800 font-medium max-w-xs leading-relaxed">
                  {lockedMessage}
                </p>
              </div>
            </motion.div>
          )}

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/90 text-gray-500">
                Enter credentials manually
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                placeholder="Enter your email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                placeholder="Enter your password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* <p className="mt-4 text-sm text-gray-600 text-center">No account? <a className="text-blue-600 underline" href="/signup">Sign up</a></p> */}
          <p
            className="mt-2 text-sm text-blue-600 text-center cursor-pointer"
            onClick={() =>
              handleForgotPassword(
                document.querySelector('input[name="email"]')?.value,
              )
            }
          >
            Forgot Password?
          </p>
        </div>
      </div>
    </div>
  );
}
