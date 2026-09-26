import { useEffect, useState } from 'react'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { createTask, deleteTask, listTasks, updateTask } from './lib/api'
import type { Task } from './types'

type Status = 'loading' | 'ready' | 'error'

function sortByCreatedAt(tasks: Task[]) {
  return [...tasks].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void loadTasks()
  }, [])

  async function loadTasks() {
    setStatus('loading')
    setError(null)
    try {
      const data = await listTasks()
      setTasks(sortByCreatedAt(data))
      setStatus('ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo conectar con la API')
      setStatus('error')
    }
  }

  async function handleCreate(title: string) {
    const created = await createTask(title)
    setTasks((prev) => sortByCreatedAt([...prev, created]))
  }

  async function handleToggle(task: Task) {
    const updated = await updateTask(task.id, { completed: !task.completed })
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  async function handleRename(task: Task, title: string) {
    const updated = await updateTask(task.id, { title })
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  async function handleDelete(task: Task) {
    await deleteTask(task.id)
    setTasks((prev) => prev.filter((t) => t.id !== task.id))
  }

  const completedCount = tasks.filter((t) => t.completed).length

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <header className="mb-10 text-center">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-accent">
            Serverless · AWS Lambda + DynamoDB
          </p>
          <h1 className="mt-3 font-display text-5xl font-medium text-ink">Tareas</h1>
          <p className="mt-3 font-body italic text-ink-muted">
            Una lista de tareas sencilla, servida por una API sin servidores.
          </p>
        </header>

        <main className="rounded-2xl border border-hairline bg-paper-raised p-8 shadow-sm">
          <TaskForm onCreate={handleCreate} />

          <div className="mt-6">
            {status === 'loading' && (
              <p className="py-10 text-center font-body text-ink-muted">Cargando tareas…</p>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <p className="font-body text-accent">{error}</p>
                <button
                  type="button"
                  onClick={() => void loadTasks()}
                  className="rounded-full border border-accent px-4 py-1.5 font-display text-sm text-accent"
                >
                  Reintentar
                </button>
              </div>
            )}

            {status === 'ready' && (
              <TaskList
                tasks={tasks}
                onToggle={handleToggle}
                onRename={handleRename}
                onDelete={handleDelete}
              />
            )}
          </div>

          {status === 'ready' && tasks.length > 0 && (
            <p className="mt-6 border-t border-hairline pt-4 text-sm text-ink-muted">
              {completedCount} de {tasks.length} tareas completadas
            </p>
          )}
        </main>

        <footer className="mt-10 text-center text-xs text-ink-muted">
          Vite + React · API Gateway v2 + Lambda (Python) · DynamoDB · Terraform
        </footer>
      </div>
    </div>
  )
}

export default App
