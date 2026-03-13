import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export function createClient() {
  const client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // MOCK: Bypass de autenticación para desarrollo local
  if ((process.env.NODE_ENV as string) === "development") {

    const isMock = typeof document !== 'undefined' && document.cookie.includes("sb-mock-session=true");
    if (isMock) {
      const originalGetUser = client.auth.getUser.bind(client.auth);
      client.auth.getUser = async (token?: string) => {
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

