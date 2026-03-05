"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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

    // Obtener rol del perfil para redirigir
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    router.push(profile?.role === "trainer" ? "/dashboard" : "/today");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#1c1c1e] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Dumbbell className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
            Fitness Bassi
          </h1>
          <p className="text-[#6e6e73] text-sm mt-1">
            Sistema profesional de entrenamiento
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5ea] p-6">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-6">
            Iniciar sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full px-3.5 py-2.5 bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl text-sm text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl text-sm text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-[#ff375f]/8 border border-[#ff375f]/20 rounded-xl px-3.5 py-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-[#ff375f] flex-shrink-0" />
                <p className="text-sm text-[#ff375f]">{error}</p>
              </div>
            )}

            <Button className="w-full" size="lg" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-[#aeaeb2] mt-6">
          Sistema interno — acceso solo por invitación
        </p>
      </div>
    </div>
  );
}
