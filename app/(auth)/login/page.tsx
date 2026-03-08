"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoPhase, setLogoPhase] = useState<"enter" | "float">("enter");

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

    await new Promise((resolve) => setTimeout(resolve, 2200));

    const destination = profile?.role === "trainer" ? "/dashboard" : "/today";
    window.location.href = destination;
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 md:py-20 lg:py-0"
      style={{
        background: "radial-gradient(ellipse at center, #1f1f1f 0%, #191919 70%)",
      }}
    >
      <style>{`
        @keyframes logoReveal {
          0% {
            opacity: 0;
            transform: scale(1.1);
            filter: blur(20px) drop-shadow(1px 1px 0px rgba(255,255,255,0.15)) drop-shadow(-1px -1px 0px rgba(255,255,255,0.15));
          }
          50% {
            opacity: 0.8;
            filter: blur(6px) drop-shadow(1px 1px 0px rgba(255,255,255,0.15)) drop-shadow(-1px -1px 0px rgba(255,255,255,0.15));
          }
          75% {
            opacity: 1;
            transform: scale(1.01);
            filter: blur(0px) drop-shadow(0 0 20px rgba(245,197,24,0.6)) drop-shadow(1px 1px 0px rgba(255,255,255,0.2)) drop-shadow(-1px -1px 0px rgba(255,255,255,0.2));
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0px) drop-shadow(0 0 6px rgba(245,197,24,0.2)) drop-shadow(1px 1px 0px rgba(255,255,255,0.15)) drop-shadow(-1px -1px 0px rgba(255,255,255,0.15));
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-5px); }
        }

        @keyframes logoGlowPulse {
          0%, 100% { 
            filter: drop-shadow(0 0 4px rgba(245,197,24,0.2)) drop-shadow(1px 1px 0px rgba(255,255,255,0.15)) drop-shadow(-1px -1px 0px rgba(255,255,255,0.15)); 
          }
          50%      { 
            filter: drop-shadow(0 0 20px rgba(245,197,24,0.5)) drop-shadow(1px 1px 0px rgba(255,255,255,0.2)) drop-shadow(-1px -1px 0px rgba(255,255,255,0.2)); 
          }
        }

        @keyframes subtitleReveal {
          0%   { opacity: 0; letter-spacing: 0.08em; }
          100% { opacity: 1; letter-spacing: 0.25em; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Logo + subtítulo ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          onAnimationEnd={() => {
            if (logoPhase === 'enter') setLogoPhase('float')
          }}
          style={{
            animation: logoPhase === 'enter'
              ? 'logoReveal 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s both'
              : 'float 4s ease-in-out infinite, logoGlowPulse 4s ease-in-out infinite',
          }}
        >
          <Image
            src="/Black and Yellow Square Fitness Logo.png"
            alt="Fitness Bassi"
            width={320}
            height={160}
            className="object-contain"
            priority
            style={{
              display: 'block',
              filter: 'drop-shadow(0 0 0px rgba(255,255,255,0)) drop-shadow(1px 1px 0px rgba(255,255,255,0.15)) drop-shadow(-1px -1px 0px rgba(255,255,255,0.15))',
            }}
          />
        </div>

        <p
          className="ls-subtitle"
          style={{
            fontSize: '11px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
            textAlign: 'center',
            marginTop: '6px',
            marginBottom: '32px',
            opacity: 0,
            animation: 'subtitleReveal 0.7s ease-out 1.1s forwards',
          }}
        >
          Tu entrenador en el bolsillo
        </p>
      </div>

      {/* ── Card formulario ── */}
      <div
        className="w-full max-w-sm md:max-w-md mx-auto rounded-2xl p-6 md:p-8 lg:p-10"
        style={{
          background: "#212121",
          border: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
          animation: "fadeInUp 500ms ease-out 0.4s forwards",
          opacity: 0,
        }}
      >
        <h2 className="text-xl font-semibold text-[#e8e8e6] mb-6">
          Iniciar sesión
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs text-[#a0a0a0] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="login-input login-input-responsive"
              style={{ transition: "border-color 200ms ease, box-shadow 200ms ease" }}
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs text-[#a0a0a0] mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="login-input login-input-responsive"
              style={{ transition: "border-color 200ms ease, box-shadow 200ms ease" }}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 animate-fade-in"
              style={{
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.2)",
              }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#f87171" }} />
              <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
            </div>
          )}

          {/* Botón Entrar */}
          <button
            type="submit"
            disabled={loading}
            className="btn-shimmer w-full py-3 rounded-xl mt-6 font-medium text-sm text-white cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            style={{
              background: "#6b7fa3",
              transition: "transform 100ms ease, opacity 150ms ease",
            }}
            onMouseDown={(e) => {
              if (!loading) e.currentTarget.style.transform = "scale(0.97)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {loading ? (
              <>
                <span
                  className="inline-block w-4 h-4 rounded-full animate-spin"
                  style={{
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                  }}
                />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        {/* Separador */}
        <div
          className="mt-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        />

        {/* Botón Demo */}
        <button
          type="button"
          className="w-full py-2.5 mt-4 text-sm cursor-pointer"
          style={{
            background: "transparent",
            border: "none",
            color: "#a0a0a0",
            transition: "color 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#e8e8e6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#a0a0a0";
          }}
          onClick={() => router.push("/dashboard")}
        >
          Entrar como Entrenador (Demo)
        </button>
      </div>

      {/* ── Footer ── */}
      <p
        className="mt-8 text-xs text-center"
        style={{ color: "rgba(255,255,255,0.25)" }}
      >
        Sistema interno — acceso solo por invitación
      </p>
    </main>
  );
}
