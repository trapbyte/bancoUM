"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function AnimatedCard({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
      className={`bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_32px_-8px_rgba(124,58,237,0.15)] hover:border-violet-200/50 transition-all duration-300 relative overflow-hidden group rounded-2xl p-6 ${className}`}
    >
      {/* Reflejo opcional en hover para dar sensación de cristal interactivo */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Contenido */}
      {children}
    </motion.div>
  );
}
