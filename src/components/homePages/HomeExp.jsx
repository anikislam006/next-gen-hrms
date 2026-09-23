"use client";

import React from "react";
import homeImage from "../../assets/home-imager.jpg";
import { motion } from "framer-motion";
import AnimatedBackground from "../Background/AnimatedBackground";
import Link from "next/link";

const HomeExp = () => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Animated Background - Ensure this has z-index 0 or lower */}
      <AnimatedBackground />

      {/* Foreground Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl px-6 py-12 md:px-10 md:py-16 backdrop-blur-3xl 
                   bg-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)]
                   border border-white/20 text-center mx-4 flex flex-col items-center"
      >
        {/* Glow Effects */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-500/30 rounded-full blur-[80px] -z-10" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/30 rounded-full blur-[80px] -z-10" />

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-[1.1]">
            Your Modern <br />
            <span className="">
              HRM Dashboard
            </span>
          </h1>
          <p className="text-lg text-white font-semibold md:text-xl max-w-md mx-auto leading-relaxed ">
            Empowering teams with seamless automation and high-end visual intelligence.
          </p>
        </motion.div>

        {/* Floating Illustration */}
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 1, 0, -1, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="mt-12 mb-12 relative group"
        >
          <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-500" />
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={homeImage.src}
            alt="HRM Dashboard"
            className="relative w-56 h-56 md:w-64 md:h-64 object-cover rounded-[2.5rem] shadow-2xl border border-white/20"
          />
        </motion.div>

        {/* Actions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full flex flex-col items-center gap-8"
        >
          <Link href="/signin" className="w-full max-w-xs">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg 
                         shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.4)] 
                         transition-all duration-300 flex items-center justify-center gap-2"
            >
              Get Started
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>
          </Link>

          {/* Minimalist Admin Notice */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-white"
          >
            <span className="relative flex h-2 w-2">
            
            </span>
            <p className="text-lg md:text-lg text-white tracking-wide">
              New here? Contact <span className="text-white font-semibold">System Admin</span> for access.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HomeExp;