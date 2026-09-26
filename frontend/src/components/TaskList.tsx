import type { Task } from '../types'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  onToggle: (task: Task) => Promise<void>
  onRename: (task: Task, title: string) => Promise<void>
  onDelete: (task: Task) => Promise<void>
}

export function TaskList({ tasks, onToggle, onRename, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="py-10 text-center font-body italic text-ink-muted">
        No tienes tareas todavía. Añade la primera arriba.
      </p>
    )
  }

  return (
    <ul>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}
