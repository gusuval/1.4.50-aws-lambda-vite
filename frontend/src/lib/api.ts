import type { Task } from '../types'

const rawBaseUrl = import.meta.env.VITE_API_URL

if (!rawBaseUrl) {
  throw new Error(
    'VITE_API_URL no está definida. Configúrala con la URL de salida de "terraform output api_endpoint".',
  )
}

const BASE_URL = rawBaseUrl.replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? `Error ${res.status} al llamar a la API`)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

export function listTasks(): Promise<Task[]> {
  return request<Task[]>('/tasks')
}

export function createTask(title: string): Promise<Task> {
  return request<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify({ title }),
  })
}

export function updateTask(
  id: string,
  changes: Partial<Pick<Task, 'title' | 'completed'>>,
): Promise<Task> {
  return request<Task>(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(changes),
  })
}

export function deleteTask(id: string): Promise<void> {
  return request<void>(`/tasks/${id}`, { method: 'DELETE' })
}
