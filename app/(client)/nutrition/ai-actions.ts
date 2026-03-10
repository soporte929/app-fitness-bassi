'use server'

import Anthropic from '@anthropic-ai/sdk'

export type MacroEstimate = {
  kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  description: string // normalized name Claude outputs, e.g. "Lentejas con chorizo (1 plato ~350g)"
}

type ParseSuccess = { success: true; data: MacroEstimate }
type ParseFailure = { success: false; error: string }

export async function parseNutritionAction(
  rawDescription: string,
): Promise<ParseSuccess | ParseFailure> {
  // Guard: missing API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return { success: false, error: 'Servicio de IA no configurado' }
  }

  // Guard: empty input
  if (!rawDescription.trim()) {
    return { success: false, error: 'Descripción vacía' }
  }

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `Eres un experto en nutrición española. Estima los macronutrientes del siguiente alimento o comida.

Alimento: ${rawDescription.trim()}

Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin explicaciones, sin comillas de markdown. El JSON debe tener exactamente estas claves:
- "kcal": número entero de calorías
- "protein_g": gramos de proteína (número decimal)
- "carbs_g": gramos de carbohidratos (número decimal)
- "fat_g": gramos de grasa (número decimal)
- "description": nombre normalizado del alimento con porción aproximada, por ejemplo "Lentejas con chorizo (1 plato ~350g)"

Si no puedes interpretar la descripción como alimento, responde exactamente: {"error":"no_parse"}

Solo JSON, nada más.`,
        },
      ],
    })

    // Extract text block
    const textBlock = message.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return { success: false, error: 'Respuesta vacía de Claude' }
    }

    // Strip markdown fences before parsing
    const rawText = textBlock.text
      .trim()
      .replace(/^```json?\s*/i, '')
      .replace(/\s*```$/, '')

    const parsed: Record<string, unknown> = JSON.parse(rawText)

    // Handle no_parse signal
    if (parsed.error === 'no_parse') {
      return { success: false, error: 'No se pudo interpretar la descripción' }
    }

    // Coerce numeric fields — Claude may return strings
    const kcal = Math.round(Number(parsed.kcal))
    const protein_g = Number(Number(parsed.protein_g).toFixed(1))
    const carbs_g = Number(Number(parsed.carbs_g).toFixed(1))
    const fat_g = Number(Number(parsed.fat_g).toFixed(1))
    const description = String(parsed.description ?? rawDescription.trim())

    const data: MacroEstimate = {
      kcal,
      protein_g,
      carbs_g,
      fat_g,
      description,
    }

    return { success: true, data }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error desconocido',
    }
  }
}
