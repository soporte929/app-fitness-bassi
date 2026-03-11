"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath, revalidateTag } from "next/cache";

export async function logClientMeasurementAction(
    clientId: string,
    payload: {
        weight_kg?: number;
        body_fat_pct?: number;
        waist_cm?: number;
        hip_cm?: number;
        chest_cm?: number;
        arm_cm?: number;
        thigh_cm?: number;
    }
) {
    try {
        const supabase = createAdminClient();

        // Only pass defined fields
        const safePayload = Object.fromEntries(
            Object.entries(payload).filter(([, v]) => v !== undefined)
        );

        const { error } = await supabase.from("client_measurements").insert({
            client_id: clientId,
            measured_at: new Date().toISOString(),
            ...safePayload,
        });

        if (error) {
            console.error("Error logging measurements:", error.message);
            return { success: false, error: error.message };
        }

        revalidatePath("/progress");
        revalidateTag("client-progress", {});
        return { success: true };
    } catch (err: any) {
        console.error("Action error logging measurements:", err.message);
        return { success: false, error: err.message || "Unknown error" };
    }
}
