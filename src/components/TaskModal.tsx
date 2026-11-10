import { useState, useEffect, useRef } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import type { Task, TaskPriority, TaskStatus } from '../types'

interface TaskModalProps {
  initialTask: Task | null
  onClose: () => void
  onSave: (taskData: Omit<Task, 'id'> & { id?: number }) => void
}

export function TaskModal({ initialTask, onClose, onSave }: TaskModalProps) {
  const [title, setTitle] = useState(initialTask?.title || '')
  const [description, setDescription] = useState(initialTask?.description || '')
  const [priority, setPriority] = useState<TaskPriority>(
    initialTask?.priority || 'Medium'
  )
  const [date, setDate] = useState(
    initialTask?.date || new Date().toISOString().slice(0, 10)
  )
  const [status, setStatus] = useState<TaskStatus>(
    initialTask?.status || 'todo'
  )

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()

    function handleGlobalKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [onClose])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) return

    onSave({
      id: initialTask?.id,
      title: title.trim(),
      description: description.trim(),
      priority,
      date,
      status,
    })
    onClose()
  }

  function handleOverlayKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      onKeyDown={handleOverlayKeyDown}
      role="presentation"
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-heading"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="modal-heading">
          {initialTask ? 'Edit Task' : 'Create New Task'}
        </h2>
        <p className="modal-subtitle">
          {initialTask
            ? 'Update task details in your workspace.'
            : 'Add a new task to your Kanban board.'}
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="task-title-input">Task Title *</label>
          <input
            id="task-title-input"
            ref={inputRef}
            type="text"
            placeholder="Enter task title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />

          <label htmlFor="task-desc-input">Description</label>
          <textarea
            id="task-desc-input"
            placeholder="Describe what needs to be done..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
          />

          <label htmlFor="task-priority-select">Priority</label>
          <select
            id="task-priority-select"
            value={priority}
            onChange={e => setPriority(e.target.value as TaskPriority)}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <label htmlFor="task-date-input">Due Date</label>
          <input
            id="task-date-input"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />

          <label htmlFor="task-status-select">Status</label>
          <select
            id="task-status-select"
            value={status}
            onChange={e => setStatus(e.target.value as TaskStatus)}
          >
            <option value="todo">To Do</option>
            <option value="progress">In Progress</option>
            <option value="done">Completed</option>
          </select>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

