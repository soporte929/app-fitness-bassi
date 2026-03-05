import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Bypass en desarrollo — quitar antes de producción
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Rutas públicas — no requieren sesión
  if (pathname.startsWith("/login")) {
    if (user) {
      // Ya autenticado — redirigir según rol
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const redirect = profile?.role === "trainer" ? "/dashboard" : "/today";
      return NextResponse.redirect(new URL(redirect, request.url));
    }
    return supabaseResponse;
  }

  // Rutas protegidas — requieren sesión
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protección de rutas por rol
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isTrainerRoute = pathname.startsWith("/dashboard") ||
    pathname.startsWith("/clients") ||
    pathname.startsWith("/exercises") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/settings");

  const isClientRoute = pathname.startsWith("/today") ||
    pathname.startsWith("/nutrition") ||
    pathname.startsWith("/progress") ||
    pathname.startsWith("/audit") ||
    pathname.startsWith("/profile");

  if (isTrainerRoute && profile?.role !== "trainer") {
    return NextResponse.redirect(new URL("/today", request.url));
  }

  if (isClientRoute && profile?.role !== "client") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
