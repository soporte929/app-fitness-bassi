'use client'

import { NutritionFreeLogSheet } from './NutritionFreeLogSheet'

type Props = {
  clientId: string
}

export function AddMealFab({ clientId }: Props) {
  return <NutritionFreeLogSheet clientId={clientId} />
}
