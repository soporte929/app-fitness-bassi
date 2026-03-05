/**
 * Cálculos nutricionales según el Método Bassi
 * Fórmulas: Cunningham y Tinsley
 */

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentario (escritorio, sin ejercicio)",
  light: "Ligero (1–2 días/semana)",
  moderate: "Moderado (3–5 días/semana)",
  active: "Activo (6–7 días/semana)",
  very_active: "Muy activo (físico + entreno)",
};

export interface NutritionInput {
  weightKg: number;
  bodyFatPct: number;
  activityLevel: ActivityLevel;
  dailySteps?: number;
  goal: "deficit" | "maintenance" | "surplus";
}

export interface NutritionResult {
  ffm: number;
  tmb_cunningham: number;
  tmb_tinsley: number;
  tmb_recommended: number;
  get: number;
  stepsBonus: number;
  targetCalories: number;
  macros: {
    protein: { g: number; kcal: number; pct: number };
    fat: { g: number; kcal: number; pct: number };
    carbs: { g: number; kcal: number; pct: number };
  };
}

export function calculateNutrition(input: NutritionInput): NutritionResult {
  const { weightKg, bodyFatPct, activityLevel, dailySteps = 7000, goal } = input;

  // Fat-Free Mass
  const ffm = weightKg * (1 - bodyFatPct / 100);

  // TMB Cunningham: 500 + (22 × FFM)
  const tmb_cunningham = 500 + 22 * ffm;

  // TMB Tinsley: 25.9 × FFM
  const tmb_tinsley = 25.9 * ffm;

  // Usamos la media como recomendada
  const tmb_recommended = (tmb_cunningham + tmb_tinsley) / 2;

  // Bonus por pasos (cada 1000 pasos sobre 5000 base = ~50 kcal)
  const stepsBonus = Math.max(0, ((dailySteps - 5000) / 1000) * 50);

  // GET = TMB × factor actividad + bonus pasos
  const get = tmb_recommended * ACTIVITY_FACTORS[activityLevel] + stepsBonus;

  // Ajuste según objetivo
  const goalAdjustment =
    goal === "deficit" ? -400 : goal === "surplus" ? +300 : 0;
  const targetCalories = Math.round(get + goalAdjustment);

  // Macros
  // Proteína: 2.2g × FFM
  const proteinG = Math.round(2.2 * ffm);
  const proteinKcal = proteinG * 4;

  // Grasa: 25% de calorías objetivo
  const fatKcal = Math.round(targetCalories * 0.25);
  const fatG = Math.round(fatKcal / 9);

  // Carbos: resto
  const carbsKcal = Math.max(0, targetCalories - proteinKcal - fatKcal);
  const carbsG = Math.round(carbsKcal / 4);

  return {
    ffm: Math.round(ffm * 10) / 10,
    tmb_cunningham: Math.round(tmb_cunningham),
    tmb_tinsley: Math.round(tmb_tinsley),
    tmb_recommended: Math.round(tmb_recommended),
    get: Math.round(get),
    stepsBonus: Math.round(stepsBonus),
    targetCalories,
    macros: {
      protein: {
        g: proteinG,
        kcal: proteinKcal,
        pct: Math.round((proteinKcal / targetCalories) * 100),
      },
      fat: {
        g: fatG,
        kcal: fatKcal,
        pct: Math.round((fatKcal / targetCalories) * 100),
      },
      carbs: {
        g: carbsG,
        kcal: carbsKcal,
        pct: Math.round((carbsKcal / targetCalories) * 100),
      },
    },
  };
}

export { ACTIVITY_LABELS, ACTIVITY_FACTORS };
