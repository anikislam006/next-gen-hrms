"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Clock } from "lucide-react";
import { useNotification } from "@/app/hook/useNotification";
import Link from "next/link";

export default function NotificationBell() {
  const [showNotifications, setShowNotifications] = useState(false);
  const bellRef = useRef(null);
  const audioRef = useRef(null);

  const { 
    notifications, 
    unreadCount, 
    handleMarkRead, 
    handleMarkAllRead, 
    loading 
  } = useNotification();

  // Initialize Sound
  useEffect(() => {
    audioRef.current = new Audio("/sounds/notificaitonsound.mp3");
  }, []);

  // Listen for count change to play sound
  const prevCount = useRef(unreadCount);
  useEffect(() => {
    if (unreadCount > prevCount.current) {
      audioRef.current?.play().catch(() => console.log("Interaction needed for audio"));
    }
    prevCount.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    const close = (e) => { 
      if (bellRef.current && !bellRef.current.contains(e.target)) setShowNotifications(false); 
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative" ref={bellRef}>
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl transition-all"
      >
        <Bell className="w-5 h-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute top-1.5 right-1.5 w-5 h-5 bg-gradient-to-tr from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg border-2 border-white"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 mt-3 w-96 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 ring-1 ring-black/5"
          >
            <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                Notifications
                {unreadCount > 0 && <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] rounded-full uppercase font-bold">{unreadCount} New</span>}
              </h3>
              {notifications.length > 0 && (
                <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-10 text-center text-gray-400 text-sm">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">No new alerts</p>
                </div>
              ) : (
                notifications.map((n) => {
                  /** * This regex splits the message at a full stop ONLY if it's 
                   * followed by a space (standard sentence ending). 
                   * This prevents email addresses like .com from breaking.
                   **/
                  const segments = n.message.split(/(?<=\. )/g);

                  return (
                    <Link 
                      key={n._id} 
                      href={n.link || "#"} 
                      onClick={() => {
                        handleMarkRead(n._id);
                        setShowNotifications(false);
                      }}
                      className="block"
                    >
                      <motion.div
                        className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${n.status === 'unread' ? 'bg-blue-50/20' : ''}`}
                      >
                        <p className={`text-sm mb-1 ${n.status === 'unread' ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                        
                        <div className="text-xs text-gray-500 leading-relaxed">
                          {segments.map((sentence, index) => (
                            sentence.trim() !== "" && (
                              <span key={index} className="block mb-0.5">
                                {sentence.trim()}
                              </span>
                            )
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5 mt-2 text-gray-400 text-[10px]">
                          <Clock className="w-3 h-3" />
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </motion.div>
                    </Link>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}