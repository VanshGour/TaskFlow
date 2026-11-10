import { useEffect, useReducer, useRef, useState, useCallback } from 'react'
import type { DragEvent } from 'react'
import './App.css'
import type { Task, TaskStatus } from './types'
import { taskReducer } from './taskReducer'
import { getTasks, saveTasks } from './db'
import socket, { type ConnectionState } from './socket'

import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { Column } from './components/Column'
import { TaskModal } from './components/TaskModal'
import { ShortcutsModal } from './components/ShortcutsModal'
import { LiveAnnouncer } from './components/LiveAnnouncer'

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Design login page',
    description: 'Create a clean and responsive login interface.',
    priority: 'High',
    date: 'Nov 10',
    status: 'todo',
  },
  {
    id: 2,
    title: 'Setup project structure',
    description: 'Organize components and folders.',
    priority: 'Medium',
    date: 'Nov 11',
    status: 'todo',
  },
  {
    id: 3,
    title: 'Write project documentation',
    description: 'Prepare the initial README.',
    priority: 'Low',
    date: 'Nov 13',
    status: 'progress',
  },
  {
    id: 4,
    title: 'Build dashboard UI',
    description: 'Create the main Kanban dashboard.',
    priority: 'High',
    date: 'Nov 09',
    status: 'progress',
  },
  {
    id: 5,
    title: 'Design task cards',
    description: 'Create reusable task card layouts.',
    priority: 'Medium',
    date: 'Nov 14',
    status: 'progress',
  },
  {
    id: 6,
    title: 'Configure service worker & offline DB',
    description: 'Cache assets and persist state in IndexedDB.',
    priority: 'Low',
    date: 'Nov 15',
    status: 'done',
  },
]

const COLUMNS: { title: string; status: TaskStatus; color: 'orange' | 'blue' | 'green' }[] = [
  { title: 'To Do', status: 'todo', color: 'orange' },
  { title: 'In Progress', status: 'progress', color: 'blue' },
  { title: 'Completed', status: 'done', color: 'green' },
]

export default function App() {
  const [state, dispatch] = useReducer(taskReducer, { tasks: [] })
  const [isLoaded, setIsLoaded] = useState(false)
  const [activePage, setActivePage] = useState('My Board')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [simulateFailure, setSimulateFailure] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionState>('disconnected')
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)

  // Accessible live announcements
  const [announcement, setAnnouncement] = useState('')
  const [isAnnouncementError, setIsAnnouncementError] = useState(false)
  const announcementTimeoutRef = useRef<number | null>(null)

  const stateRef = useRef(state)
  stateRef.current = state

  const draggedTaskId = useRef<number | null>(null)
  const isIncomingSync = useRef(false)

  const announce = useCallback((message: string, isError = false) => {
    if (announcementTimeoutRef.current !== null) {
      clearTimeout(announcementTimeoutRef.current)
    }
    setAnnouncement(message)
    setIsAnnouncementError(isError)

    announcementTimeoutRef.current = window.setTimeout(() => {
      setAnnouncement('')
      setIsAnnouncementError(false)
    }, 4000)
  }, [])

  // 1. Initial Load from IndexedDB
  useEffect(() => {
    let cancelled = false

    async function loadInitialTasks() {
      try {
        const savedTasks = await getTasks()
        if (cancelled) return

        let tasksToLoad = savedTasks
        if (
          savedTasks.length === 0 &&
          localStorage.getItem('taskflow_seeded') !== 'true'
        ) {
          tasksToLoad = initialTasks
          await saveTasks(initialTasks)
          localStorage.setItem('taskflow_seeded', 'true')
        }

        dispatch({
          type: 'RESTORE_STATE',
          payload: { tasks: tasksToLoad },
        })
        announce('Workspace tasks loaded from storage.')
      } catch (error) {
        console.error('Failed to load tasks from IndexedDB:', error)
        if (!cancelled) {
          dispatch({
            type: 'RESTORE_STATE',
            payload: { tasks: initialTasks },
          })
        }
      } finally {
        if (!cancelled) setIsLoaded(true)
      }
    }

    loadInitialTasks()

    return () => {
      cancelled = true
    }
  }, [announce])

  // 2. Track Browser Online/Offline Status
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
      announce('Internet connection restored. Live sync active.')
      socket.connect()
    }

    function handleOffline() {
      setIsOnline(false)
      announce('Working offline. All changes are saved locally to IndexedDB.', true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [announce])

  // 3. WebSocket Real-time Multi-Tab Sync with Auto-Reconnect
  useEffect(() => {
    const unsubStatus = socket.onStatusChange(status => {
      setConnectionStatus(status)
      if (status === 'connected') {
        // When connection is established or restored, sync current state
        socket.send({
          type: 'TASK_UPDATED',
          payload: { tasks: stateRef.current.tasks },
        })
      }
    })

    const unsubMessage = socket.onMessage(message => {
      try {
        if (message.type === 'TASK_UPDATED' && Array.isArray(message.payload?.tasks)) {
          isIncomingSync.current = true
          dispatch({
            type: 'RESTORE_STATE',
            payload: { tasks: message.payload.tasks as Task[] },
          })
          saveTasks(message.payload.tasks as Task[])
          announce('Tasks updated in real time from another tab.')
        }
      } catch (err) {
        console.error('Error handling WebSocket sync message:', err)
      }
    })

    return () => {
      unsubStatus()
      unsubMessage()
    }
  }, [announce])

  // 4. Save to IndexedDB and Broadcast when State Changes
  useEffect(() => {
    if (!isLoaded) return

    // If change came from another tab, avoid echoing it back
    if (isIncomingSync.current) {
      isIncomingSync.current = false
      return
    }

    // Persist to IndexedDB
    saveTasks(state.tasks).catch(err => {
      console.error('IndexedDB auto-save failed:', err)
    })

    // Broadcast update to other tabs via WebSocket
    socket.send({
      type: 'TASK_UPDATED',
      payload: { tasks: state.tasks },
    })
  }, [state.tasks, isLoaded])

  // 5. Optimistic Updates with Rollback
  async function performOptimisticAction(
    actionName: string,
    executeDispatch: () => void,
    taskTitle: string
  ) {
    const previousState = stateRef.current
    setIsSyncing(true)

    // Apply update optimistically to UI immediately
    executeDispatch()
    announce(`${taskTitle} (${actionName}). Syncing...`)

    try {
      // Simulate sync delay & handle failure if simulation toggle is active
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          if (simulateFailure) {
            reject(new Error('Simulated network sync failure'))
          } else {
            resolve()
          }
        }, 700)
      })

      setIsSyncing(false)
      announce(`${taskTitle} synced successfully.`)
    } catch (error) {
      console.warn(`Sync failed for ${actionName}, rolling back:`, error)
      // Automatic rollback to previous snapshot
      dispatch({
        type: 'RESTORE_STATE',
        payload: previousState,
      })
      setIsSyncing(false)
      announce(
        `Sync failed! Optimistic update rolled back to previous state.`,
        true
      )
    }
  }

  // Task Actions
  function handleSaveTask(taskData: Omit<Task, 'id'> & { id?: number }) {
    if (editingTask && taskData.id) {
      const updated: Task = {
        id: taskData.id,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        date: taskData.date,
        status: taskData.status,
      }
      performOptimisticAction(
        'updated',
        () => dispatch({ type: 'EDIT_TASK', payload: updated }),
        `Task "${updated.title}"`
      )
    } else {
      const newTask: Task = {
        id: Date.now(),
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        date: taskData.date,
        status: taskData.status,
      }
      performOptimisticAction(
        'created',
        () => dispatch({ type: 'ADD_TASK', payload: newTask }),
        `Task "${newTask.title}"`
      )
    }
    setEditingTask(null)
  }

  function handleDeleteTask(id: number) {
    const target = state.tasks.find(t => t.id === id)
    const title = target ? target.title : 'Task'

    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }

    performOptimisticAction(
      'deleted',
      () => dispatch({ type: 'DELETE_TASK', payload: id }),
      `Task "${title}"`
    )
  }

  function handleMoveTask(id: number, status: TaskStatus) {
    const task = state.tasks.find(t => t.id === id)
    if (!task || task.status === status) return

    const statusNames: Record<TaskStatus, string> = {
      todo: 'To Do',
      progress: 'In Progress',
      done: 'Completed',
    }

    performOptimisticAction(
      `moved to ${statusNames[status]}`,
      () => dispatch({ type: 'MOVE_TASK', payload: { id, status } }),
      `Task "${task.title}"`
    )
  }

  // Drag and Drop
  function handleDragStart(event: DragEvent<HTMLElement>, id: number) {
    draggedTaskId.current = id
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(id))
  }

  function handleDrop(event: DragEvent<HTMLElement>, status: TaskStatus) {
    event.preventDefault()
    const id =
      draggedTaskId.current ?? Number(event.dataTransfer.getData('text/plain'))

    if (id) {
      handleMoveTask(id, status)
    }
    draggedTaskId.current = null
  }

  // Filter tasks based on active navigation tab
  const visibleTasks = state.tasks.filter(task => {
    if (activePage === 'Upcoming') {
      return task.status !== 'done'
    }
    if (activePage === 'Completed') {
      return task.status === 'done'
    }
    return true
  })

  if (!isLoaded) {
    return (
      <div className="loading" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true" />
        <p>Loading TaskFlow workspace...</p>
      </div>
    )
  }

  return (
    <div className="app">
      <LiveAnnouncer message={announcement} isError={isAnnouncementError} />

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenShortcuts={() => setShowShortcuts(true)}
      />

      <main className="main-content" tabIndex={-1}>
        <Header
          activePage={activePage}
          connectionStatus={connectionStatus}
          isOnline={isOnline}
          isSyncing={isSyncing}
          simulateFailure={simulateFailure}
          onToggleSimulateFailure={() => setSimulateFailure(prev => !prev)}
          onAddTask={() => {
            setEditingTask(null)
            setShowModal(true)
          }}
        />

        <div className="board" role="region" aria-label="Kanban board columns">
          {COLUMNS.map(column => {
            const columnTasks = visibleTasks.filter(
              t => t.status === column.status
            )
            return (
              <Column
                key={column.status}
                title={column.title}
                status={column.status}
                color={column.color}
                tasks={columnTasks}
                onEdit={task => {
                  setEditingTask(task)
                  setShowModal(true)
                }}
                onDelete={handleDeleteTask}
                onMove={handleMoveTask}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
              />
            )
          })}
        </div>
      </main>

      {showModal && (
        <TaskModal
          initialTask={editingTask}
          onClose={() => {
            setShowModal(false)
            setEditingTask(null)
          }}
          onSave={handleSaveTask}
        />
      )}

      {showShortcuts && (
        <ShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  )
}
