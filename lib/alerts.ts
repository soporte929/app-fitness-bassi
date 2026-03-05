export type AlertLevel = "info" | "warning" | "critical";

export interface Alert {
  id: string;
  level: AlertLevel;
  message: string;
  action?: string;
}

export interface ClientAlertInput {
  adherencePct: number;
  daysSinceLastWorkout: number;
  weightDeltaKg: number;        // últimas 2 semanas (+ = subiendo)
  waistDeltaCm: number;         // últimas 2 semanas (+ = subiendo)
  phase: "deficit" | "surplus" | "maintenance";
  weeklyWorkoutsCompleted: number;
  weeklyWorkoutsTarget: number;
}

export function computeAlerts(input: ClientAlertInput): Alert[] {
  const alerts: Alert[] = [];

  // Adherencia crítica
  if (input.adherencePct < 50) {
    alerts.push({
      id: "adherence-critical",
      level: "critical",
      message: `Adherencia muy baja (${input.adherencePct}%)`,
      action: "Contactar cliente urgentemente",
    });
  } else if (input.adherencePct < 70) {
    alerts.push({
      id: "adherence-warning",
      level: "warning",
      message: `Adherencia baja esta semana (${input.adherencePct}%)`,
      action: "Revisar con el cliente",
    });
  }

  // Días sin entrenar
  if (input.daysSinceLastWorkout >= 7) {
    alerts.push({
      id: "no-workout-critical",
      level: "critical",
      message: `Sin entrenar ${input.daysSinceLastWorkout} días`,
      action: "Llamar al cliente",
    });
  } else if (input.daysSinceLastWorkout >= 4) {
    alerts.push({
      id: "no-workout-warning",
      level: "warning",
      message: `Sin entrenar ${input.daysSinceLastWorkout} días`,
    });
  }

  // Cintura subiendo en déficit
  if (input.phase === "deficit" && input.waistDeltaCm > 1) {
    alerts.push({
      id: "waist-rising",
      level: "critical",
      message: `Cintura subiendo +${input.waistDeltaCm} cm en fase de déficit`,
      action: "Revisar plan nutricional",
    });
  }

  // Peso estancado en déficit
  if (input.phase === "deficit" && input.weightDeltaKg > -0.1 && input.weightDeltaKg < 0.5) {
    alerts.push({
      id: "weight-stalled",
      level: "warning",
      message: "Peso estancado en las últimas 2 semanas",
      action: "Ajustar calorías o aumentar actividad",
    });
  }

  // Peso bajando demasiado rápido en déficit
  if (input.phase === "deficit" && input.weightDeltaKg < -1.5) {
    alerts.push({
      id: "weight-fast",
      level: "warning",
      message: `Bajando demasiado rápido (${input.weightDeltaKg.toFixed(1)} kg/semana)`,
      action: "Aumentar calorías ligeramente",
    });
  }

  // Entrenos completados bajos esta semana
  if (input.weeklyWorkoutsTarget > 0) {
    const ratio = input.weeklyWorkoutsCompleted / input.weeklyWorkoutsTarget;
    if (ratio < 0.5) {
      alerts.push({
        id: "weekly-workouts-low",
        level: "warning",
        message: `Solo ${input.weeklyWorkoutsCompleted}/${input.weeklyWorkoutsTarget} entrenos esta semana`,
      });
    }
  }

  return alerts;
}

export const alertColors: Record<AlertLevel, { bg: string; border: string; text: string; icon: string }> = {
  info:     { bg: "#0071e3/8",  border: "#0071e3/20", text: "#0071e3",  icon: "#0071e3" },
  warning:  { bg: "#ff9f0a/8",  border: "#ff9f0a/20", text: "#b36200",  icon: "#ff9f0a" },
  critical: { bg: "#ff375f/8",  border: "#ff375f/20", text: "#cc0022",  icon: "#ff375f" },
};
