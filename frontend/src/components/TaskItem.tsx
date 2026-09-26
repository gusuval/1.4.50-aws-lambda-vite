import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { Task } from '../types'
import { CheckIcon, PencilIcon, TrashIcon } from './icons'

interface TaskItemProps {
  task: Task
  onToggle: (task: Task) => Promise<void>
  onRename: (task: Task, title: string) => Promise<void>
  onDelete: (task: Task) => Promise<void>
}

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
})

export function TaskItem({ task, onToggle, onRename, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(task.title)
  const [isBusy, setIsBusy] = useState(false)

  async function commitRename() {
    const trimmed = draftTitle.trim()
    setIsEditing(false)
    if (!trimmed || trimmed === task.title) {
      setDraftTitle(task.title)
      return
    }
    setIsBusy(true)
    try {
      await onRename(task, trimmed)
    } finally {
      setIsBusy(false)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.currentTarget.blur()
    } else if (event.key === 'Escape') {
      setDraftTitle(task.title)
      setIsEditing(false)
    }
  }

  return (
    <li className="group flex items-start gap-4 border-b border-hairline py-4 last:border-none">
      <button
        type="button"
        onClick={() => onToggle(task)}
        disabled={isBusy}
        aria-pressed={task.completed}
        aria-label={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
        className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          task.completed
            ? 'border-done bg-done text-paper-raised'
            : 'border-hairline text-transparent hover:border-accent'
        }`}
      >
        <CheckIcon className="h-3.5 w-3.5" />
      </button>

      <div className="min-w-0 flex-1">
        {isEditing ? (
          <input
            autoFocus
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={handleKeyDown}
            className="w-full border-b border-accent bg-transparent font-body text-lg text-ink outline-none"
          />
        ) : (
          <p
            onClick={() => setIsEditing(true)}
            className={`cursor-text font-body text-lg leading-snug ${
              task.completed ? 'text-ink-muted line-through' : 'text-ink'
            }`}
          >
            {task.title}
          </p>
        )}
        <p className="mt-1 text-xs uppercase tracking-wide text-ink-muted">
          creada el {dateFormatter.format(new Date(task.createdAt))}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          aria-label="Editar tarea"
          className="rounded-full p-2 text-ink-muted hover:bg-accent-soft hover:text-accent"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          disabled={isBusy}
          aria-label="Eliminar tarea"
          className="rounded-full p-2 text-ink-muted hover:bg-accent-soft hover:text-accent"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </li>
  )
}
