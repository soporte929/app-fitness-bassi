'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DeleteClientDialog } from '@/components/trainer/delete-client-dialog'
import { ChevronDown, ChevronUp, Loader2, Trash2 } from 'lucide-react'
import { updateClientAction } from '../actions'
import type { ActivityLevel, Phase, Goal } from '@/lib/supabase/types'

type Props = {
  clientId: string
  clientName: string
  initial: {
    weight_kg: number
    body_fat_pct: number | null
    phase: Phase
    goal: Goal
    activity_level: ActivityLevel
    daily_steps: number
    notes: string | null
  }
}

const phaseOpts: { value: Phase; label: string }[] = [
  { value: 'deficit', label: 'Déficit' },
  { value: 'maintenance', label: 'Mantenimiento' },
  { value: 'surplus', label: 'Superávit' },
]
const goalOpts: { value: Goal; label: string }[] = [
  { value: 'deficit', label: 'Perder grasa' },
  { value: 'maintenance', label: 'Mantener' },
  { value: 'surplus', label: 'Ganar masa' },
]
const actOpts: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'Sedentario' },
  { value: 'light', label: 'Ligero' },
  { value: 'moderate', label: 'Moderado' },
  { value: 'active', label: 'Activo' },
  { value: 'very_active', label: 'Muy activo' },
]

const iCls = 'w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all'

export function EditClientPanel({ clientId, clientName, initial }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const [saved, setSaved] = useState(false)
  const [del, setDel] = useState(false)
  const [f, setF] = useState({
    weight_kg: String(initial.weight_kg),
    body_fat_pct: initial.body_fat_pct != null ? String(initial.body_fat_pct) : '',
    phase: initial.phase, goal: initial.goal,
    activity_level: initial.activity_level,
    daily_steps: String(initial.daily_steps),
    notes: initial.notes ?? '',
  })

  const dirty = Number(f.weight_kg) !== initial.weight_kg ||
    (f.body_fat_pct === '' ? null : Number(f.body_fat_pct)) !== initial.body_fat_pct ||
    f.phase !== initial.phase || f.goal !== initial.goal ||
    f.activity_level !== initial.activity_level ||
    Number(f.daily_steps) !== initial.daily_steps ||
    (f.notes || null) !== initial.notes

  const reset = () => { setF({ weight_kg: String(initial.weight_kg), body_fat_pct: initial.body_fat_pct != null ? String(initial.body_fat_pct) : '', phase: initial.phase, goal: initial.goal, activity_level: initial.activity_level, daily_steps: String(initial.daily_steps), notes: initial.notes ?? '' }); setOpen(false) }

  const save = () => start(async () => {
    await updateClientAction(clientId, { weight_kg: Number(f.weight_kg), body_fat_pct: f.body_fat_pct !== '' ? Number(f.body_fat_pct) : null, phase: f.phase, goal: f.goal, activity_level: f.activity_level, daily_steps: Number(f.daily_steps), notes: f.notes || null })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  })

  const lbl = 'text-xs font-medium text-[var(--text-secondary)] block mb-1'
  const hint = 'text-[10px] text-[var(--text-secondary)] mt-1'

  return (
    <>
      <Card>
        <CardHeader>
          <button onClick={() => setOpen(v => !v)} className="flex items-center justify-between w-full text-left">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Editar datos del cliente</p>
            {open ? <ChevronUp className="w-4 h-4 text-[var(--text-secondary)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />}
          </button>
        </CardHeader>
        {open && (
          <CardContent className="space-y-4 pt-0">
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Peso (kg)</label><input type="number" inputMode="decimal" step="0.1" value={f.weight_kg} onChange={e => setF(p => ({ ...p, weight_kg: e.target.value }))} className={iCls} />{Number(f.weight_kg) !== initial.weight_kg && <p className={hint}>Anterior: {initial.weight_kg} kg</p>}</div>
              <div><label className={lbl}>% Grasa</label><input type="number" inputMode="decimal" step="0.1" placeholder="—" value={f.body_fat_pct} onChange={e => setF(p => ({ ...p, body_fat_pct: e.target.value }))} className={iCls} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Fase</label><select value={f.phase} onChange={e => setF(p => ({ ...p, phase: e.target.value as Phase }))} className={iCls}>{phaseOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
              <div><label className={lbl}>Objetivo</label><select value={f.goal} onChange={e => setF(p => ({ ...p, goal: e.target.value as Goal }))} className={iCls}>{goalOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            </div>
            <div><label className={lbl}>Nivel de actividad</label><select value={f.activity_level} onChange={e => setF(p => ({ ...p, activity_level: e.target.value as ActivityLevel }))} className={iCls}>{actOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <div><label className={lbl}>Pasos diarios</label><input type="number" inputMode="numeric" step="500" value={f.daily_steps} onChange={e => setF(p => ({ ...p, daily_steps: e.target.value }))} className={iCls} /></div>
            <div><label className={lbl}>Notas</label><textarea rows={3} value={f.notes} onChange={e => setF(p => ({ ...p, notes: e.target.value }))} placeholder="Observaciones..." className={`${iCls} resize-none`} /></div>
            <div className="flex items-center justify-between pt-1 gap-2">
              <Button variant="danger" size="sm" onClick={() => setDel(true)} disabled={pending}><Trash2 className="w-3.5 h-3.5" /> Borrar</Button>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={reset} disabled={pending}>Cancelar</Button>
                <Button size="sm" onClick={save} disabled={pending || !dirty}>{pending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando…</> : saved ? '✓ Guardado' : 'Guardar'}</Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
      {del && <DeleteClientDialog clientId={clientId} clientName={clientName} onCancel={() => setDel(false)} />}
    </>
  )
}
