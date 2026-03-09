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

// ─────────────────────────────────────────────────────────────────────────────
// Módulo v4.0 — Nuevas funciones de cálculo nutricional
// ─────────────────────────────────────────────────────────────────────────────

export type NutritionPhase = "deficit" | "recomposition" | "volume" | "maintenance";
export type Sex = "male" | "female";

export interface TMBInput {
  weightKg: number;
  fatPercent?: number;  // Si se pasa → Katch-McArdle. Si no → Mifflin-St Jeor
  heightCm?: number;    // Requerido si no hay fatPercent
  age?: number;         // Requerido si no hay fatPercent
  sex?: Sex;            // Requerido si no hay fatPercent, default 'male'
}

export interface MacrosResult {
  protein: { g: number; kcal: number };
  fat: { g: number; kcal: number };
  carbs: { g: number; kcal: number };
}

/**
 * Calcula la Tasa Metabólica Basal (TMB).
 * - Con fatPercent: usa Katch-McArdle → 370 + (21.6 × FFM)
 * - Sin fatPercent: usa Mifflin-St Jeor
 */
export function calculateTMB(input: TMBInput): number {
  if (input.fatPercent !== undefined) {
    // Katch-McArdle: 370 + 21.6 × FFM
    const ffm = input.weightKg * (1 - input.fatPercent / 100);
    return Math.round(370 + 21.6 * ffm);
  } else {
    // Mifflin-St Jeor
    const { weightKg, heightCm = 170, age = 30, sex = "male" } = input;
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return Math.round(sex === "male" ? base + 5 : base - 161);
  }
}

/**
 * Calcula el Gasto Energético Total Diario (TDEE).
 * TDEE = TMB × factor de actividad
 */
export function calculateTDEE(tmb: number, activityLevel: ActivityLevel): number {
  return Math.round(tmb * ACTIVITY_FACTORS[activityLevel]);
}

// Factores de ajuste calórico según fase (uso interno)
const GOAL_FACTORS: Record<NutritionPhase, number> = {
  deficit: 0.85,
  maintenance: 1.0,
  recomposition: 1.0,  // Mismas kcal que mantenimiento, distinto reparto de macros
  volume: 1.075,
};

/**
 * Calcula las calorías objetivo según fase nutricional.
 * - deficit: TDEE × 0.85
 * - maintenance / recomposition: TDEE × 1.0
 * - volume: TDEE × 1.075
 */
export function calculateTargetCalories(tdee: number, phase: NutritionPhase): number {
  return Math.round(tdee * GOAL_FACTORS[phase]);
}

// Factores de proteína por kg de peso (uso interno)
const PROTEIN_FACTORS: Record<NutritionPhase, number> = {
  deficit: 2.2,
  recomposition: 2.0,
  volume: 1.8,
  maintenance: 2.0,
};

// Factores de grasa por kg de peso (uso interno)
const FAT_FACTORS: Record<NutritionPhase, number> = {
  deficit: 0.8,
  recomposition: 0.9,
  volume: 1.0,
  maintenance: 0.9,
};

/**
 * Calcula la distribución de macronutrientes.
 * - Proteínas: factor × weightKg (varía por fase)
 * - Grasas: factor × weightKg (varía por fase)
 * - Carbohidratos: calorías restantes / 4
 */
export function calculateMacros(
  weightKg: number,
  phase: NutritionPhase,
  targetCalories: number
): MacrosResult {
  const proteinG = Math.round(PROTEIN_FACTORS[phase] * weightKg);
  const fatG = Math.round(FAT_FACTORS[phase] * weightKg);
  const proteinKcal = proteinG * 4;
  const fatKcal = fatG * 9;
  const carbsKcal = Math.max(0, targetCalories - proteinKcal - fatKcal);
  const carbsG = Math.round(carbsKcal / 4);

  return {
    protein: { g: proteinG, kcal: proteinKcal },
    fat: { g: fatG, kcal: fatKcal },
    carbs: { g: carbsG, kcal: carbsKcal },
  };
}
