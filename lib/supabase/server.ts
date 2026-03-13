import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

export async function createClient() {
  const cookieStore = await cookies();

  const client = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // En Server Components el set es ignorado — no es un error
          }
        },
      },
    }
  );

  // MOCK: Bypass de autenticación para desarrollo local si la DB falla
  if ((process.env.NODE_ENV as string) === "development") {

    const mockSession = cookieStore.get("sb-mock-session");
    if (mockSession?.value === "true") {
      const originalGetUser = client.auth.getUser.bind(client.auth);
      client.auth.getUser = async (token?: string) => {
        const result = await originalGetUser(token);
        if (!result.data.user) {
          // Si no hay sesión real, devolvemos el perfil de superadmin hardcodeado
          return {
            data: {
              user: {
                id: "cba64b1a-f929-465c-aa78-d6e099a00dc6", // Superadmin ID
                email: "superadmin@bassi.com",
                aud: "authenticated",
                role: "authenticated",
                app_metadata: {},
                user_metadata: { full_name: "Super Admin", role: "trainer" },
                created_at: new Date().toISOString(),
              } as any
            },
            error: null
          };
        }
        return result;
      };
    }
  }

  return client;
}

