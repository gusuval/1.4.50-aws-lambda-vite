import { useState } from 'react'
import type { FormEvent } from 'react'

interface TaskFormProps {
  onCreate: (title: string) => Promise<void>
}

export function TaskForm({ onCreate }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || isSubmitting) return

    setIsSubmitting(true)
    setError(null)
    try {
      await onCreate(trimmed)
      setTitle('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la tarea')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex items-stretch gap-3 border-b-2 border-hairline pb-3 focus-within:border-accent">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Escribe una nueva tarea…"
          aria-label="Título de la nueva tarea"
          className="flex-1 bg-transparent font-body text-lg text-ink placeholder:text-ink-muted/70 outline-none"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="shrink-0 self-end rounded-full bg-accent px-5 py-2 font-display text-sm tracking-wide text-paper transition-opacity disabled:opacity-40"
        >
          {isSubmitting ? 'Añadiendo…' : 'Añadir'}
        </button>
      </div>
      {error && <p className="text-sm text-accent">{error}</p>}
    </form>
  )
}
