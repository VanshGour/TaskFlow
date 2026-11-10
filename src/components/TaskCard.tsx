import type { DragEvent, KeyboardEvent } from 'react'
import type { Task, TaskStatus } from '../types'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: number) => void
  onMove: (id: number, status: TaskStatus) => void
  onDragStart: (event: DragEvent<HTMLElement>, id: number) => void
}

const STATUS_FLOW: TaskStatus[] = ['todo', 'progress', 'done']
const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  progress: 'In Progress',
  done: 'Completed',
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onMove,
  onDragStart,
}: TaskCardProps) {
  const currentIndex = STATUS_FLOW.indexOf(task.status)
  const prevStatus = currentIndex > 0 ? STATUS_FLOW[currentIndex - 1] : null
  const nextStatus =
    currentIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIndex + 1] : null

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // Left arrow or '[' moves to previous column
    if ((event.key === 'ArrowLeft' || event.key === '[') && prevStatus) {
      event.preventDefault()
      onMove(task.id, prevStatus)
    }
    // Right arrow or ']' moves to next column
    else if ((event.key === 'ArrowRight' || event.key === ']') && nextStatus) {
      event.preventDefault()
      onMove(task.id, nextStatus)
    }
    // Enter or 'e' to edit
    else if (event.key === 'Enter' || event.key === 'e') {
      event.preventDefault()
      onEdit(task)
    }
    // Delete or Backspace to delete
    else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      onDelete(task.id)
    }
  }

  return (
    <article
      className="task-card"
      draggable
      tabIndex={0}
      role="article"
      aria-label={`Task: ${task.title}, priority ${task.priority}, status ${STATUS_LABELS[task.status]}. Use Left/Right Arrow to move, Enter to edit, Delete to remove.`}
      aria-roledescription="draggable card"
      onDragStart={event => onDragStart(event, task.id)}
      onKeyDown={handleKeyDown}
    >
      <div className="task-top">
        <span className={`priority ${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>

        <div className="task-actions" role="group" aria-label="Task actions">
          {prevStatus && (
            <button
              type="button"
              className="move-btn"
              title={`Move to ${STATUS_LABELS[prevStatus]} (Left Arrow)`}
              aria-label={`Move task "${task.title}" back to ${STATUS_LABELS[prevStatus]}`}
              onClick={() => onMove(task.id, prevStatus)}
            >
              ←
            </button>
          )}

          {nextStatus && (
            <button
              type="button"
              className="move-btn"
              title={`Move to ${STATUS_LABELS[nextStatus]} (Right Arrow)`}
              aria-label={`Move task "${task.title}" forward to ${STATUS_LABELS[nextStatus]}`}
              onClick={() => onMove(task.id, nextStatus)}
            >
              →
            </button>
          )}

          <button
            type="button"
            className="edit-btn"
            aria-label={`Edit task "${task.title}"`}
            onClick={() => onEdit(task)}
          >
            Edit
          </button>

          <button
            type="button"
            className="delete-btn"
            aria-label={`Delete task "${task.title}"`}
            onClick={() => onDelete(task.id)}
          >
            Delete
          </button>
        </div>
      </div>

      <h3 className="task-title">{task.title}</h3>
      {task.description && <p className="task-desc">{task.description}</p>}

      <div className="task-footer">
        <span className="task-date">
          <span aria-hidden="true">📅</span> {task.date || 'No due date'}
        </span>
        <span className="avatar" aria-label="Assigned to Vansh Gour">
          VG
        </span>
      </div>
    </article>
  )
}

