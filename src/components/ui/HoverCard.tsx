"use client";

import { useRef, useCallback } from "react";

export function HoverCard({ children, className, style = {} }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const wrapper = wrapperRef.current;
    const tilt = tiltRef.current;
    const shine = shineRef.current;
    const glow = glowRef.current;
    if (!wrapper || !tilt || !shine || !glow) return;

    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pctX = (x / rect.width) * 100;
    const pctY = (y / rect.height) * 100;

    const rotX = ((y / rect.height) - 0.5) * -14;
    const rotY = ((x / rect.width) - 0.5) * 14;
    tilt.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.05)`;

    shine.style.background = `radial-gradient(ellipse 60% 50% at ${pctX}% ${pctY}%, rgba(255,255,255,0.55), rgba(255,255,255,0.08) 55%, transparent 75%)`;
    shine.style.opacity = '1';

    glow.style.opacity = '1';
    glow.style.background = `radial-gradient(ellipse at ${pctX}% ${pctY}%, rgba(167,139,250,0.4) 0%, transparent 70%)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const tilt = tiltRef.current;
    const shine = shineRef.current;
    const glow = glowRef.current;
    if (!tilt || !shine || !glow) return;
    tilt.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
    shine.style.opacity = '0';
    glow.style.opacity = '0';
  }, []);

  return (
    <div ref={wrapperRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="relative w-full h-full">
      <div
        ref={glowRef}
        className="absolute -inset-4 rounded-[1.5rem] pointer-events-none blur-xl"
        style={{ opacity: 0, transition: 'opacity 0.35s ease', zIndex: -1 }}
      />
      <div ref={tiltRef} className={className} style={{ ...style, transition: 'transform 0.18s ease-out' }}>
        {children}
        <div
          ref={shineRef}
          className="absolute inset-0 rounded-[inherit] pointer-events-none z-30"
          style={{ opacity: 0, transition: 'opacity 0.2s ease', mixBlendMode: 'overlay' }}
        />
      </div>
    </div>
  );
}
