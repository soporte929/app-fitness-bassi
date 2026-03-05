import { TrainerSidebar } from "@/components/trainer/sidebar";

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <TrainerSidebar />
      {/* pl-16 = 64px para el strip de iconos colapsado */}
      <main className="pl-16 min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
