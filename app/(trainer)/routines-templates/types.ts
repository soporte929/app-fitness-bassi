import type { Json } from '@/lib/supabase/types'


export interface RoutineExerciseInput {
  name: string
  muscle_group: string
  target_sets: number
  target_reps: string
  target_rir: number
  notes: string | null
}

export interface RoutineDayInput {
  name: string
  order_index: number
  exercises: RoutineExerciseInput[]
}

export interface RoutinePlanInput {
  name: string
  description: string | null
  days_per_week: number

  days: RoutineDayInput[]
  replace_structure?: boolean
}


export interface RoutineBuilderInitial {
  name: string
  description: string
  days_per_week: number

  days: Array<{
    name: string
    exercises: Array<{
      name: string
      muscle_group: string
      target_sets: number
      target_reps: string
      target_rir: number
      notes: string | null
    }>
  }>
}

export const MUSCLE_GROUP_OPTIONS = [
  'Pecho',
  'Espalda',
  'Hombros',
  'Bíceps',
  'Tríceps',
  'Cuádriceps',
  'Isquios',
  'Glúteos',
  'Gemelos',
  'Core',
  'Cardio',
  'Full Body',
  'Otro',
] as const

export function daysToJson(days: RoutineDayInput[]): Json {
  return days.map((day) => ({
    name: day.name,
    order_index: day.order_index,
    exercises: day.exercises.map((exercise) => ({
      name: exercise.name,
      muscle_group: exercise.muscle_group,
      target_sets: exercise.target_sets,
      target_reps: exercise.target_reps,
      target_rir: exercise.target_rir,
      notes: exercise.notes,
    })),
  }))
}
