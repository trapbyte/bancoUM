import { ReactNode } from "react";

// Server-compatible - no "use client" needed since it's now pure CSS animations
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
    <div
      style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}
      className={`bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_32px_-8px_rgba(124,58,237,0.15)] hover:border-violet-200/50 transition-all duration-300 relative overflow-hidden group rounded-2xl p-6 
      animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out
      ${className}`}
    >
      {/* Reflejo opcional en hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      {children}
    </div>
  );
}
