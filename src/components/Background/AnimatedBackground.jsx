"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function AnimatedBackground() {
  const [dots, setDots] = useState([]);

  useEffect(() => {
    // Generate stable random positions only once on client
    const newDots = [...Array(20)].map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      duration: Math.random() * 10 + 10,
    }));
    setDots(newDots);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background gradient animation */}
      <motion.div
        animate={{
          background: [
            "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
            "linear-gradient(45deg, #f093fb 0%, #f5576c 100%)",
            "linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)",
            "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0"
      />

      {/* Floating dots */}
      {dots.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          initial={{ x: dot.x, y: dot.y }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Rotating shapes */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 left-1/4 w-32 h-32 border border-white/10 rounded-full"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-white/10 rounded-lg"
      />
    </div>
  );
}

export default AnimatedBackground;
