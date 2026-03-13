import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Bypass en desarrollo — quitar antes de producción
  if ((process.env.NODE_ENV as string) === "development") {
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

  // MOCK: Bypass de autenticación para desarrollo local
  if (process.env.NODE_ENV === "development") {
    const mockSession = request.cookies.get("sb-mock-session");
    if (mockSession?.value === "true") {
      const originalGetUser = supabase.auth.getUser.bind(supabase.auth);
      supabase.auth.getUser = async (token?: string) => {
        const result = await originalGetUser(token);
        if (!result.data.user) {
          return {
            data: {
              user: {
                id: "cba64b1a-f929-465c-aa78-d6e099a00dc6", // Superadmin ID
                email: "superadmin@bassi.com",
                aud: "authenticated",
                role: "authenticated",
                app_metadata: {},
                user_metadata: { full_name: "Super Admin", role: "trainer" },
              } as any
            },
            error: null
          };
        }
        return result;
      };
    }
  }

  const { data: { user } } = await supabase.auth.getUser();


  const { pathname } = request.nextUrl;

  // Rutas públicas — no requieren sesión
  if (pathname.startsWith("/auth/") || pathname.startsWith("/set-password")) {
    return supabaseResponse;
  }

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

  // IMPORTANT: isTrainerRoute must be checked BEFORE isClientRoute because
  // some client prefixes ("/routines", "/nutrition") collide with trainer
  // routes ("/routines-templates", "/nutrition-plans"). We check trainer
  // first and return early to avoid the false positive.
  const isTrainerRoute = pathname.startsWith("/dashboard") ||
    pathname.startsWith("/clients") ||
    pathname.startsWith("/routines-templates") ||
    pathname.startsWith("/plans") ||
    pathname.startsWith("/nutrition-plans") ||
    pathname.startsWith("/exercises") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/settings");

  if (isTrainerRoute) {
    if (profile?.role !== "trainer") {
      return NextResponse.redirect(new URL("/today", request.url));
    }
    return supabaseResponse;
  }

  // Nutrición deshabilitada — redirigir a /today
  if (pathname === "/nutrition" || pathname.startsWith("/nutrition/")) {
    return NextResponse.redirect(new URL("/today", request.url));
  }

  const isClientRoute = pathname.startsWith("/today") ||
    pathname.startsWith("/history") ||
    pathname.startsWith("/progress") ||
    pathname.startsWith("/audit") ||
    pathname.startsWith("/profile") ||
    pathname === "/routines" || pathname.startsWith("/routines/") ||
    pathname.startsWith("/workout") ||
    pathname.startsWith("/revisions");

  if (isClientRoute && profile?.role !== "client") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
