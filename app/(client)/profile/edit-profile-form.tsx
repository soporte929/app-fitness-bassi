'use client'

import { useState, useTransition } from 'react'
import { Pencil, X, Check, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateProfileAction } from './actions'

type Props = {
  initial: {
    full_name: string | null
    avatar_url: string | null
  }
}

const inputCls =
  'w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--text-muted)]'

export function EditProfileForm({ initial }: Props) {
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState(initial.full_name ?? '')
  const [avatarUrl, setAvatarUrl] = useState(initial.avatar_url ?? '')
  const [imgError, setImgError] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleCancel() {
    setFullName(initial.full_name ?? '')
    setAvatarUrl(initial.avatar_url ?? '')
    setError(null)
    setImgError(false)
    setEditing(false)
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateProfileAction({
        full_name: fullName,
        avatar_url: avatarUrl || null,
      })
      if (!result.success) {
        setError(result.error ?? 'Error al guardar')
        return
      }
      setEditing(false)
    })
  }

  const displayName = fullName || initial.full_name || ''
  const displayAvatar = avatarUrl || initial.avatar_url || ''
  const initial_char = displayName?.[0]?.toUpperCase() ?? '?'

  if (!editing) {
    return (
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {displayAvatar && !imgError ? (
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-[var(--accent)] text-xl font-bold">{initial_char}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold text-[var(--text-primary)] truncate">
              {displayName || <span className="text-[var(--text-muted)] italic">Sin nombre</span>}
            </p>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex-shrink-0 w-7 h-7 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-colors"
              aria-label="Editar perfil"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
          {displayAvatar && (
            <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{displayAvatar}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Avatar preview */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {avatarUrl && !imgError ? (
            <img
              src={avatarUrl}
              alt="preview"
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <User className="w-6 h-6 text-[var(--accent)]" />
          )}
        </div>
        <p className="text-xs text-[var(--text-muted)]">Vista previa de avatar</p>
      </div>

      {/* Nombre */}
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">
          Nombre completo
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Tu nombre completo"
          className={inputCls}
          autoFocus
        />
      </div>

      {/* Avatar URL */}
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">
          URL de foto (opcional)
        </label>
        <input
          type="url"
          value={avatarUrl}
          onChange={(e) => {
            setAvatarUrl(e.target.value)
            setImgError(false)
          }}
          placeholder="https://ejemplo.com/foto.jpg"
          className={inputCls}
        />
        <p className="text-[11px] text-[var(--text-muted)] mt-1">
          URL pública de cualquier imagen (Gravatar, etc.)
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-[var(--danger)]">{error}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
            'bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-50'
          )}
        >
          {isPending ? (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          {isPending ? 'Guardando…' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all disabled:opacity-50"
        >
          <X className="w-3.5 h-3.5" />
          Cancelar
        </button>
      </div>
    </div>
  )
}
