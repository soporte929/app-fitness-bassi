'use client'

import { useState, useTransition } from 'react'
import { Loader2, Sparkles, X, ChevronLeft } from 'lucide-react'
import { parseNutritionAction, type MacroEstimate } from '@/app/(client)/nutrition/ai-actions'
import { createNutritionFreeLogAction } from '@/app/(client)/nutrition/free-log-actions'

type Step = 'input' | 'loading' | 'confirm' | 'fallback'

export function AIFoodParserModal({ clientId }: { clientId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<Step>('input')
  const [description, setDescription] = useState('')
  const [estimate, setEstimate] = useState<MacroEstimate | null>(null)
  const [manualKcal, setManualKcal] = useState('')
  const [manualProtein, setManualProtein] = useState('')
  const [manualCarbs, setManualCarbs] = useState('')
  const [manualFat, setManualFat] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [inputError, setInputError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const closeModal = () => {
    setIsOpen(false)
    setTimeout(() => {
      setStep('input')
      setDescription('')
      setEstimate(null)
      setManualKcal('')
      setManualProtein('')
      setManualCarbs('')
      setManualFat('')
      setErrorMsg(null)
      setInputError(null)
    }, 300)
  }

  const handleAnalyze = () => {
    if (!description.trim()) {
      setInputError('Describe el alimento antes de analizar')
      return
    }
    setInputError(null)
    // Set loading BEFORE startTransition so spinner appears immediately
    setStep('loading')
    startTransition(async () => {
      const result = await parseNutritionAction(description)
      if (result.success) {
        setEstimate(result.data)
        setManualKcal(String(result.data.kcal))
        setManualProtein(String(result.data.protein_g))
        setManualCarbs(String(result.data.carbs_g))
        setManualFat(String(result.data.fat_g))
        setStep('confirm')
      } else {
        setErrorMsg(result.error)
        setManualKcal('')
        setManualProtein('')
        setManualCarbs('')
        setManualFat('')
        setStep('fallback')
      }
    })
  }

  const handleSave = () => {
    startTransition(async () => {
      await createNutritionFreeLogAction({
        clientId,
        foodName: estimate?.description || description,
        grams: null,
        calories: Number(manualKcal) || null,
        proteinG: Number(manualProtein) || null,
        carbsG: Number(manualCarbs) || null,
        fatG: Number(manualFat) || null,
      })
      closeModal()
    })
  }

  const goBackToInput = () => {
    setEstimate(null)
    setErrorMsg(null)
    setManualKcal('')
    setManualProtein('')
    setManualCarbs('')
    setManualFat('')
    setStep('input')
  }

  return (
    <>
      {/* Inline trigger button — NOT a FAB, not fixed-positioned */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 text-xs font-medium text-[#6b7fa3] hover:text-[#fb8500] transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Analizar con IA
      </button>

      {/* Modal overlay */}
      <div
        className={`fixed inset-0 z-[90] transition-opacity duration-300 ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeModal}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Bottom sheet */}
        <div
          className={`absolute bottom-0 left-0 right-0 mx-auto max-w-[430px] rounded-t-2xl bg-[#1a1a1a] transition-transform duration-300 ${
            isOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[rgba(255,255,255,0.05)]">
            <div className="flex items-center gap-2">
              {(step === 'confirm' || step === 'fallback') && (
                <button
                  onClick={goBackToInput}
                  className="text-[#a0a0a0] hover:text-white p-1 -ml-1"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <h3 className="text-base font-semibold text-[#e8e8e6]">
                {step === 'input' && 'Analizar alimento con IA'}
                {step === 'loading' && 'Analizando...'}
                {step === 'confirm' && 'Confirmar macros estimados'}
                {step === 'fallback' && 'Introduce los macros manualmente'}
              </h3>
            </div>
            {step !== 'loading' && (
              <button onClick={closeModal} className="text-[#a0a0a0] hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="px-5 py-5 space-y-4">
            {/* INPUT STEP */}
            {step === 'input' && (
              <>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    if (inputError) setInputError(null)
                  }}
                  placeholder="Ej: un plato de lentejas con chorizo, una manzana mediana, 2 huevos revueltos..."
                  rows={4}
                  className="w-full bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-xl py-3 px-4 text-sm text-[#e8e8e6] placeholder-[#6b6b6b] focus:outline-none focus:border-[#fb8500] resize-none"
                  autoFocus
                />
                {inputError && (
                  <p className="text-xs text-red-400">{inputError}</p>
                )}
                <button
                  onClick={handleAnalyze}
                  className="w-full py-3 bg-[#fb8500] rounded-xl text-sm font-semibold text-white active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Analizar
                </button>
              </>
            )}

            {/* LOADING STEP */}
            {step === 'loading' && (
              <div className="py-10 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[#fb8500] animate-spin" />
                <p className="text-sm text-[#a0a0a0]">Claude está analizando...</p>
              </div>
            )}

            {/* CONFIRM STEP */}
            {step === 'confirm' && estimate && (
              <>
                <p className="text-xs text-[#a0a0a0] leading-relaxed">
                  {estimate.description}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#a0a0a0] mb-1.5 uppercase tracking-wide">
                      Kcal
                    </label>
                    <input
                      type="number"
                      value={manualKcal}
                      onChange={(e) => setManualKcal(e.target.value)}
                      className="w-full bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-xl py-2.5 px-3 text-sm text-[#e8e8e6] focus:outline-none focus:border-[#fb8500]"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#a0a0a0] mb-1.5 uppercase tracking-wide">
                      Proteina (g)
                    </label>
                    <input
                      type="number"
                      value={manualProtein}
                      onChange={(e) => setManualProtein(e.target.value)}
                      className="w-full bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-xl py-2.5 px-3 text-sm text-[#e8e8e6] focus:outline-none focus:border-[#fb8500]"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#a0a0a0] mb-1.5 uppercase tracking-wide">
                      Carbos (g)
                    </label>
                    <input
                      type="number"
                      value={manualCarbs}
                      onChange={(e) => setManualCarbs(e.target.value)}
                      className="w-full bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-xl py-2.5 px-3 text-sm text-[#e8e8e6] focus:outline-none focus:border-[#fb8500]"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#a0a0a0] mb-1.5 uppercase tracking-wide">
                      Grasa (g)
                    </label>
                    <input
                      type="number"
                      value={manualFat}
                      onChange={(e) => setManualFat(e.target.value)}
                      className="w-full bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-xl py-2.5 px-3 text-sm text-[#e8e8e6] focus:outline-none focus:border-[#fb8500]"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={goBackToInput}
                    className="flex-1 py-3 bg-[rgba(255,255,255,0.05)] rounded-xl text-sm font-medium text-[#e8e8e6] active:scale-[0.98] transition-transform"
                  >
                    Atras
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="flex-[2] py-3 bg-[#fb8500] rounded-xl text-sm font-semibold text-white active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Guardar
                  </button>
                </div>
              </>
            )}

            {/* FALLBACK STEP */}
            {step === 'fallback' && (
              <>
                {errorMsg && (
                  <div className="bg-[rgba(255,59,48,0.08)] border border-[rgba(255,59,48,0.2)] rounded-xl px-4 py-3">
                    <p className="text-xs text-red-400">{errorMsg}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs text-[#a0a0a0] mb-1.5 uppercase tracking-wide">
                      Nombre
                    </label>
                    <input
                      type="text"
                      defaultValue={description}
                      onChange={(e) => {
                        // Update description for use in handleSave foodName
                        setDescription(e.target.value)
                      }}
                      className="w-full bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-xl py-2.5 px-3 text-sm text-[#e8e8e6] focus:outline-none focus:border-[#fb8500]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#a0a0a0] mb-1.5 uppercase tracking-wide">
                      Kcal
                    </label>
                    <input
                      type="number"
                      value={manualKcal}
                      onChange={(e) => setManualKcal(e.target.value)}
                      className="w-full bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-xl py-2.5 px-3 text-sm text-[#e8e8e6] focus:outline-none focus:border-[#fb8500]"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#a0a0a0] mb-1.5 uppercase tracking-wide">
                      Proteina (g)
                    </label>
                    <input
                      type="number"
                      value={manualProtein}
                      onChange={(e) => setManualProtein(e.target.value)}
                      className="w-full bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-xl py-2.5 px-3 text-sm text-[#e8e8e6] focus:outline-none focus:border-[#fb8500]"
                      min="0"
                      step="0.1"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#a0a0a0] mb-1.5 uppercase tracking-wide">
                      Carbos (g)
                    </label>
                    <input
                      type="number"
                      value={manualCarbs}
                      onChange={(e) => setManualCarbs(e.target.value)}
                      className="w-full bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-xl py-2.5 px-3 text-sm text-[#e8e8e6] focus:outline-none focus:border-[#fb8500]"
                      min="0"
                      step="0.1"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#a0a0a0] mb-1.5 uppercase tracking-wide">
                      Grasa (g)
                    </label>
                    <input
                      type="number"
                      value={manualFat}
                      onChange={(e) => setManualFat(e.target.value)}
                      className="w-full bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-xl py-2.5 px-3 text-sm text-[#e8e8e6] focus:outline-none focus:border-[#fb8500]"
                      min="0"
                      step="0.1"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={goBackToInput}
                    className="flex-1 py-3 bg-[rgba(255,255,255,0.05)] rounded-xl text-sm font-medium text-[#e8e8e6] active:scale-[0.98] transition-transform"
                  >
                    Atras
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="flex-[2] py-3 bg-[#fb8500] rounded-xl text-sm font-semibold text-white active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Guardar
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Safe area spacer for iOS */}
          <div className="h-6" />
        </div>
      </div>
    </>
  )
}
