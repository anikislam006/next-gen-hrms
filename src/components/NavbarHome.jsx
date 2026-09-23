"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabaseClient";
import { motion } from "framer-motion";

const NavbarHome = () => {
  const { user, setUser } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    Cookies.remove("id");
    Cookies.remove("token");
    Cookies.remove("name");
    Cookies.remove("role");
    Cookies.remove("email");

    setUser(null);
    router.push("/signin");
  };

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full backdrop-blur-xl bg-white/40 shadow-lg border-b border-white/30"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between font-poppins">
        
        {/* Logo */}
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-gray-800"
        >
          HR MANAGEMENT SYSTEM
        </motion.h1>

        {/* Right buttons */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4"
        >

          {/* If NOT logged in */}
          {!user && (
            <Link
              href="/signin"
              className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 active:scale-95 transition-all duration-200"
            >
              Sign In
            </Link>
          )}

          {/* If logged in */}
          {user && (
            <>
              <Link
                href="/dashboard"
                className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 active:scale-95 transition-all duration-200"
              >
                Dashboard
              </Link>

              <button
                onClick={handleSignOut}
                className="px-5 py-2 bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 active:scale-95 transition-all duration-200"
              >
                Logout
              </button>
            </>
          )}

        </motion.div>
      </div>
    </motion.nav>
  );
};

export default NavbarHome;
