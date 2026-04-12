"use client";
// Redirect page — el middleware se encarga del routing real,
// pero esta página actúa como fallback visible.
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardIndex() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    const rol = (session?.user as { rol?: string })?.rol ?? "cliente";
    router.replace(`/dashboard/${rol}`);
  }, [session, status, router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
    </div>
  );
}
