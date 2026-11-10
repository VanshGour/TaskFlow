import type { DragEvent } from 'react'
import type { Task, TaskStatus } from '../types'
import { TaskCard } from './TaskCard'

interface ColumnProps {
  title: string
  status: TaskStatus
  color: 'orange' | 'blue' | 'green'
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (id: number) => void
  onMove: (id: number, status: TaskStatus) => void
  onDragStart: (event: DragEvent<HTMLElement>, id: number) => void
  onDrop: (event: DragEvent<HTMLElement>, status: TaskStatus) => void
}

export function Column({
  title,
  status,
  color,
  tasks,
  onEdit,
  onDelete,
  onMove,
  onDragStart,
  onDrop,
}: ColumnProps) {
  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  return (
    <section
      className={`column column-${status}`}
      role="region"
      aria-label={`${title} column, containing ${tasks.length} task${tasks.length === 1 ? '' : 's'}`}
      onDragOver={handleDragOver}
      onDrop={event => onDrop(event, status)}
    >
      <div className="column-heading">
        <div className="column-title">
          <span className={`status-dot ${color}`} aria-hidden="true" />
          <h2>{title}</h2>
          <span className="task-count" aria-label={`${tasks.length} tasks`}>
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="task-list">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onMove={onMove}
            onDragStart={onDragStart}
          />
        ))}

        {tasks.length === 0 && (
          <div className="empty-column" aria-label={`Empty column: drop tasks here`}>
            <p>No tasks in {title}</p>
            <span className="empty-hint">Drop or use keyboard arrow keys to move here</span>
          </div>
        )}
      </div>
    </section>
  )
}

