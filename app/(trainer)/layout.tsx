"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { TrainerSidebar } from "@/components/trainer/sidebar";
import LoadingScreen from "@/components/ui/loading-screen";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    setIsMounted(true);

    const handleResize = () => {
      const mobileResize = window.innerWidth < 768;
      setIsMobile(mobileResize);
      if (mobileResize) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <TrainerSidebar
        collapsed={collapsed}
        isMobile={isMobile}
        isMounted={isMounted}
        onToggle={() => setCollapsed(!collapsed)}
        onClose={() => setCollapsed(true)}
        onOpen={() => setCollapsed(false)}
      />

      {/* Mobile top bar with hamburger */}
      <div className="sticky top-0 z-30 flex items-center h-14 px-4 bg-[var(--bg-surface)] border-b border-[var(--border)] md:hidden">
        <button
          onClick={() => setCollapsed(false)}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5 text-[var(--text-primary)]" />
        </button>
        <div className="flex-1 flex items-center justify-center">
          <Image
            src="/2.png"
            alt="Fitness Bassi"
            width={80}
            height={32}
            className="object-contain"
            priority
          />
        </div>
        {/* Spacer para centrar logo */}
        <div className="w-9 h-9" />
      </div>

      {/* Main content adjusts left padding based on sidebar state */}
      <main
        className={cn(
          "pl-0 min-h-screen overflow-x-hidden transition-all duration-300",
          !isMounted ? "md:pl-64" : isMobile ? "pl-0" : "md:pl-64"
        )}
      >
        <Suspense fallback={<LoadingScreen />}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
