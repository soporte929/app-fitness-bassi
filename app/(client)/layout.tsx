import { Suspense } from 'react'
import Image from 'next/image'
import { ClientNav } from '@/components/client/nav'
import { RestTimer } from '@/components/client/rest-timer'
import LoadingScreen from '@/components/ui/loading-screen'
import { ActiveSessionBanner } from '@/components/client/active-session-banner'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <div
        className="relative mx-auto min-h-screen w-full max-w-[430px] md:shadow-2xl flex flex-col"
        style={{ background: 'var(--bg-base)' }}
      >
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-4"
          style={{ height: '44px', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}
        >
          <Image
            src="/2.png"
            alt="Fitness Bassi"
            width={28}
            height={28}
            className="object-contain"
            style={{ mixBlendMode: 'screen' }}
          />
          <ThemeToggle />
        </header>
        <main className="flex-1 pb-20">
          <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
        </main>
        <ClientNav />
        <RestTimer />
        <ActiveSessionBanner />
      </div>
    </div>
  )
}
