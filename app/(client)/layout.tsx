import { ClientNav } from "@/components/client/nav";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col max-w-lg mx-auto relative">
      <main className="flex-1 pb-20">{children}</main>
      <ClientNav />
    </div>
  );
}
