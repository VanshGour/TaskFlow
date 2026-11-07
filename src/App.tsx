
import { useReducer, useState } from 'react'
import type { FormEvent, DragEvent } from 'react'
import './App.css'

import type { Task, TaskStatus } from './types'
import { taskReducer } from './taskReducer'

// Initial Tasks

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Design login page',
    description: 'Create a clean and responsive login interface.',
    priority: 'High',
    date: 'Nov 10',
    status: 'todo'
  },
  {
    id: 2,
    title: 'Setup project structure',
    description: 'Organize components and folders.',
    priority: 'Medium',
    date: 'Nov 11',
    status: 'todo'
  },
  {
    id: 3,
    title: 'Write project documentation',
    description: 'Prepare the initial README.',
    priority: 'Low',
    date: 'Nov 13',
    status: 'todo'
  },
  {
    id: 4,
    title: 'Build dashboard UI',
    description: 'Create the main Kanban dashboard.',
    priority: 'High',
    date: 'Nov 09',
    status: 'progress'
  },
  {
    id: 5,
    title: 'Design task cards',
    description: 'Create reusable task card layouts.',
    priority: 'Medium',
    date: 'Nov 10',
    status: 'progress'
  },
  {
    id: 6,
    title: 'Initialize React project',
    description: 'Setup React using Vite.',
    priority: 'Low',
    date: 'Nov 07',
    status: 'done'
  }
]

// Task Card Component

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: number) => void
}

function TaskCard({
  task,
  onEdit,
  onDelete
}: TaskCardProps) {

  function handleDragStart(e: DragEvent<HTMLDivElement>) {
    e.dataTransfer.setData('taskId', String(task.id))
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      className="task-card"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="task-top">

        <span className={`priority ${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>

        <div className="task-actions">

          <button
            className="edit-btn"
            onClick={() => onEdit(task)}
          >
            Edit
          </button>

          <button
            className="delete-btn"
            onClick={() => {
              if (window.confirm('Delete this task?')) {
                onDelete(task.id)
              }
            }}
          >
            Delete
          </button>

        </div>
      </div>

      <h3>{task.title}</h3>

      <p>{task.description}</p>

      <div className="task-footer">
        <span>📅 {task.date}</span>
        <span className="avatar">VG</span>
      </div>

    </div>
  )
}

// Column Component

interface ColumnProps {
  title: string
  items: Task[]
  color: string
  status: TaskStatus
  onEdit: (task: Task) => void
  onDelete: (id: number) => void
  onMove: (id: number, status: TaskStatus) => void
}

function Column({
  title,
  items,
  color,
  status,
  onEdit,
  onDelete,
  onMove
}: ColumnProps) {

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()

    const taskId = Number(
      e.dataTransfer.getData('taskId')
    )

    if (taskId) {
      onMove(taskId, status)
    }
  }

  return (
    <div
      className="column"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >

      <div className="column-heading">

        <div className="column-title">

          <span className={`status-dot ${color}`}></span>

          <h2>{title}</h2>

          <span className="task-count">
            {items.length}
          </span>

        </div>

      </div>

      <div className="task-list">

        {items.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

      </div>

    </div>
  )
}

// Add / Edit Task Modal

interface AddTaskModalProps {
  onClose: () => void
  onSave: (task: Task) => void
  initialTask: Task | null
}

function AddTaskModal({
  onClose,
  onSave,
  initialTask
}: AddTaskModalProps) {

  const [title, setTitle] = useState(
    initialTask?.title || ''
  )

  const [description, setDescription] = useState(
    initialTask?.description || ''
  )

  const [priority, setPriority] = useState<Task['priority']>(
    initialTask?.priority || 'Medium'
  )

  const [date, setDate] = useState('')

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!title.trim()) return

    const formattedDate = date
      ? new Date(date + 'T00:00:00').toLocaleDateString(
          'en-US',
          {
            month: 'short',
            day: 'numeric'
          }
        )
      : initialTask?.date || 'No date'

    const savedTask: Task = {
      id: initialTask?.id ?? Date.now(),
      title: title.trim(),
      description,
      priority,
      date: formattedDate,
      status: initialTask?.status ?? 'todo'
    }

    onSave(savedTask)
    onClose()
  }

  return (
    <div className="modal-overlay">

      <div className="modal">

        <h2>
          {initialTask ? 'Edit Task' : 'Create New Task'}
        </h2>

        <p className="modal-subtitle">
          Add or update a task in your workspace.
        </p>

        <form onSubmit={handleSubmit}>

          <label>Task Title</label>

          <input
            type="text"
            placeholder="Enter task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label>Description</label>

          <textarea
            placeholder="Describe your task"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label>Priority</label>

          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as Task['priority'])
            }
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <label>Due Date</label>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <div className="modal-actions">

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-btn"
            >
              {initialTask ? 'Save Changes' : 'Add Task'}
            </button>

          </div>

        </form>

      </div>

    </div>
  )
}

// Main Application

function App() {

  const [state, dispatch] = useReducer(taskReducer, {
    tasks: initialTasks
  })

  const [showModal, setShowModal] = useState(false)

  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const [syncing, setSyncing] = useState(false)

  // Add or Edit Task

  function saveTask(task: Task) {

    if (editingTask) {

      dispatch({
        type: 'EDIT_TASK',
        payload: task
      })

    } else {

      dispatch({
        type: 'ADD_TASK',
        payload: task
      })

    }

    setEditingTask(null)
  }

  // Delete Task

  function deleteTask(id: number) {

    dispatch({
      type: 'DELETE_TASK',
      payload: id
    })

  }

  // Optimistic Update with Rollback

  async function moveTask(
    id: number,
    status: TaskStatus
  ) {

    const previousState = state

    const task = state.tasks.find(
      item => item.id === id
    )

    if (!task || task.status === status) return

    // Update UI immediately

    dispatch({
      type: 'MOVE_TASK',
      payload: { id, status }
    })

    setSyncing(true)

    try {

      // Simulate server request

      await new Promise<void>((resolve, reject) => {

        setTimeout(() => {

          // 80% success, 20% failure

          if (Math.random() > 0.2) {
            resolve()
          } else {
            reject(new Error('Server request failed'))
          }

        }, 1000)

      })

      console.log('Task synchronized successfully')

    } catch (error) {

      console.error('Task update failed:', error)

      // Restore previous state

      dispatch({
        type: 'RESTORE_STATE',
        payload: previousState
      })

      alert('Task update failed. Previous state restored.')

    } finally {

      setSyncing(false)

    }

  }

  // Modal Controls

  function openAddModal() {
    setEditingTask(null)
    setShowModal(true)
  }

  function openEditModal(task: Task) {
    setEditingTask(task)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingTask(null)
  }

  // Filter Tasks

  const todoTasks = state.tasks.filter(
    task => task.status === 'todo'
  )

  const progressTasks = state.tasks.filter(
    task => task.status === 'progress'
  )

  const doneTasks = state.tasks.filter(
    task => task.status === 'done'
  )

  // Dashboard

  return (

    <div className="app">

      <aside className="sidebar">

        <h1 className="logo">
          Task<span>Flow.</span>
        </h1>

        <p className="nav-label">WORKSPACE</p>

        <div className="nav-item active">
          ▦ &nbsp; My Board
        </div>

        <div className="nav-item">
          ◷ &nbsp; Upcoming
        </div>

        <div className="nav-item">
          ✓ &nbsp; Completed
        </div>

        <div className="sidebar-bottom">

          <div className="avatar large">VG</div>

          <div>
            <strong>Vansh Gour</strong>
            <p>My Workspace</p>
          </div>

        </div>

      </aside>

      <main className="main-content">

        <header className="topbar">

          <span>Workspace / My Board</span>

          <span className="today">
            November 2026
          </span>

        </header>

        <section className="board-header">

          <div>

            <p className="welcome">
              WELCOME BACK 👋
            </p>

            <h1>My Tasks</h1>

            <p className="subtitle">
              Organize your work and get things done.
            </p>

          </div>

          <div className="board-actions">

            <span className="sync-status">
              {syncing ? 'Syncing...' : 'All changes saved'}
            </span>

            <button
              className="add-task-btn"
              onClick={openAddModal}
            >
              + Add Task
            </button>

          </div>

        </section>

        <section className="board">

          <Column
            title="To Do"
            items={todoTasks}
            color="orange"
            status="todo"
            onEdit={openEditModal}
            onDelete={deleteTask}
            onMove={moveTask}
          />

          <Column
            title="In Progress"
            items={progressTasks}
            color="blue"
            status="progress"
            onEdit={openEditModal}
            onDelete={deleteTask}
            onMove={moveTask}
          />

          <Column
            title="Done"
            items={doneTasks}
            color="green"
            status="done"
            onEdit={openEditModal}
            onDelete={deleteTask}
            onMove={moveTask}
          />

        </section>

      </main>

      {showModal && (

        <AddTaskModal
          onClose={closeModal}
          onSave={saveTask}
          initialTask={editingTask}
        />

      )}

    </div>

  )
}

export default App
