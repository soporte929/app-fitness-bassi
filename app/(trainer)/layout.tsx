"use client";

import { Suspense, useEffect, useState } from "react";
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
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    setCollapsed(mobile); // Start collapsed on mobile, open on desktop

    const handleResize = () => {
      const mobileResize = window.innerWidth < 768;
      setIsMobile(mobileResize);
      if (mobileResize) {
        setCollapsed(true);
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
        <span className="ml-3 text-sm font-semibold text-[var(--text-primary)] tracking-wide">
          Fitness Bassi
        </span>
      </div>

      {/* Main content adjusts left padding based on sidebar state */}
      <main
        className={cn(
          "pl-0 min-h-screen overflow-x-hidden transition-all duration-300",
          !isMounted ? "md:pl-60" : collapsed ? "md:pl-16" : "md:pl-60"
        )}
      >
        <Suspense fallback={<LoadingScreen />}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
