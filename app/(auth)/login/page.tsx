"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError || !data.user) {
      setError("Email o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    router.push(profile?.role === "trainer" ? "/dashboard" : "/today");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-[32px] font-bold tracking-[0.1em] uppercase text-[var(--text-primary)]">
            BASSI
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1 tracking-wide">
            Performance. Precision. Progress.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--bg-surface)] rounded-lg border border-[var(--border)] p-8">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
            Iniciar sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full px-3.5 py-2.5 bg-[var(--bg-base)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 bg-[var(--bg-base)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-[var(--danger)]/10 border border-[var(--danger)]/20 rounded-md px-3.5 py-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-[var(--danger)] flex-shrink-0" />
                <p className="text-sm text-[var(--danger)]">{error}</p>
              </div>
            )}

            <Button className="w-full" size="lg" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.push("/dashboard")}
            >
              Entrar como Entrenador (Demo)
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          Sistema interno — acceso solo por invitación
        </p>
      </div>
    </div>
  );
}
