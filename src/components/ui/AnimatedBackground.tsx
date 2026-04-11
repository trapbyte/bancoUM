"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-[#FAFAFA]">
      {/* Blob 1 */}
      <motion.div
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -100, 100, 0],
          scale: [1, 1.2, 0.8, 1],
          backgroundColor: ["#7C3AED", "#EC4899", "#38BDF8", "#7C3AED"], // Purple to Pink to Blue
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-[120px] opacity-20"
      />

      {/* Blob 2 */}
      <motion.div
        animate={{
          x: [0, -120, 80, 0],
          y: [0, 120, -80, 0],
          scale: [1, 0.9, 1.3, 1],
          backgroundColor: ["#38BDF8", "#A78BFA", "#F59E0B", "#38BDF8"], // Blue to Lavander to Amber
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-[40%] right-[-10%] w-[45vw] h-[45vw] rounded-full mix-blend-multiply filter blur-[140px] opacity-20"
      />

      {/* Blob 3 */}
      <motion.div
        animate={{
          x: [0, 80, -100, 0],
          y: [0, 50, -150, 0],
          scale: [1, 1.4, 0.9, 1],
          backgroundColor: ["#EC4899", "#F59E0B", "#7C3AED", "#EC4899"], // Pink to Amber to Purple
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
        className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-[150px] opacity-15"
      />

      {/* Subtle grain/noise overlay to make it look premium and not just flat gradients */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
    </div>
  );
}
