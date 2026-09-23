"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, 
  LogOut, 
  User, 
  Crown, 
  Shield, 
  Target, 
  Briefcase, 
  Zap 
} from "lucide-react";

import { Button } from "./ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "./ui/dialog";

// Modularized Components
import NotificationBell from "./NotificationBell";

export default function Header() {
  const { user, UserAllDetails, setUser } = useAuth();
  const router = useRouter();
  
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const profileRef = useRef(null);

  // Sign out logic
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    ["token", "id", "name", "role", "email"].forEach((c) => Cookies.remove(c));
    setUser(null);
    router.push("/signin");
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Role Mapping for premium UI badges
  const getRoleInfo = () => {
    const roles = {
      SuperAdmin: { icon: Crown, label: "Super Admin", color: "text-red-600", bg: "bg-red-50" },
      admin: { icon: Shield, label: "Administrator", color: "text-purple-600", bg: "bg-purple-50" },
      HrAdmin: { icon: Target, label: "HR & Admin", color: "text-blue-600", bg: "bg-blue-50" },
      Hr: { icon: Briefcase, label: "HR Manager", color: "text-blue-600", bg: "bg-blue-50" },
    };
    return roles[user?.role] || { icon: User, label: "Employee", color: "text-green-600", bg: "bg-green-50" };
  };

  const roleInfo = getRoleInfo();
  const userName = user?.name || "User";

  return (
    <>
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/20 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          
          {/* Left: Welcome Message */}
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="hidden sm:block">
                <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
                  Welcome back, {userName}!
                </h2>
                <div className="flex items-center gap-2">
                  <roleInfo.icon className={`w-3.5 h-3.5 ${roleInfo.color}`} />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {roleInfo.label} | {UserAllDetails?.designation} | {UserAllDetails?.department}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            
            {/* Notification Bell (Real-time + Sound) */}
            <NotificationBell />

            {/* Settings Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(true)}
              className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl transition-all duration-200"
            >
              <Settings className="w-5 h-5" />
            </motion.button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-3 p-1.5 pl-3 hover:bg-gray-100/80 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-gray-900">{userName}</p>
                  <p className="text-[10px] font-medium text-gray-400 tracking-wider uppercase">{user?.role}</p>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                  <span className="text-white font-bold text-sm">
                    {userName.charAt(0)}
                  </span>
                </div>
              </motion.button>

              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 ring-1 ring-black/5"
                  >
                    <div className="px-4 py-4 border-b border-gray-50 bg-gray-50/30">
                      <p className="font-bold text-gray-900">{userName}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 ${roleInfo.bg} rounded-md mt-3`}>
                        <roleInfo.icon className={`w-3 h-3 ${roleInfo.color}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-tight ${roleInfo.color}`}>
                          {roleInfo.label}
                        </span>
                      </div>
                    </div>

                    <div className="py-2">
                      <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                        <User className="w-4 h-4 text-gray-400" />
                        Account Profile
                      </button>
                      <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                        <Zap className="w-4 h-4 text-gray-400" />
                        Activities
                      </button>
                    </div>

                    <div className="border-t border-gray-50 pt-2 px-2">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSignOut}
                        className="w-full px-3 py-2.5 text-left text-sm text-rose-600 font-semibold hover:bg-rose-50 rounded-xl flex items-center gap-3 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white relative">
            <div className="relative z-10">
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                   <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                      <Settings className="w-6 h-6 text-white" />
                   </div>
                   <div>
                    <DialogTitle className="text-2xl font-bold tracking-tight">System Settings</DialogTitle>
                    <DialogDescription className="text-blue-100">
                      Customize your workspace and account security
                    </DialogDescription>
                   </div>
                </div>
              </DialogHeader>
            </div>
          </div>
          <div className="p-8 bg-white">
             <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                   <div>
                      <p className="text-sm font-bold text-gray-900">Email Notifications</p>
                      <p className="text-xs text-gray-500">Receive alerts about leave approvals via email</p>
                   </div>
                   <div className="w-12 h-6 bg-blue-600 rounded-full relative p-1 cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm" />
                   </div>
                </div>
             </div>
             <div className="mt-8 flex justify-end">
                <Button onClick={() => setShowSettings(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl shadow-lg shadow-blue-200">
                   Save Changes
                </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}