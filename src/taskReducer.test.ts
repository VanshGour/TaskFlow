import { describe, it, expect } from 'vitest'
import { taskReducer, type TaskState, type TaskAction } from './taskReducer'
import type { Task } from './types'

const sampleTasks: Task[] = [
  {
    id: 1,
    title: 'Design login page',
    description: 'Create a clean and responsive login interface.',
    priority: 'High',
    date: '2026-11-10',
    status: 'todo',
  },
  {
    id: 2,
    title: 'Setup project structure',
    description: 'Organize components and folders.',
    priority: 'Medium',
    date: '2026-11-11',
    status: 'progress',
  },
  {
    id: 3,
    title: 'Write project documentation',
    description: 'Prepare the initial README.',
    priority: 'Low',
    date: '2026-11-13',
    status: 'done',
  },
]

describe('taskReducer', () => {
  it('should add a new task with ADD_TASK without mutating previous state', () => {
    const initialState: TaskState = { tasks: sampleTasks }
    const newTask: Task = {
      id: 4,
      title: 'Implement WebSockets',
      description: 'Support multi-tab real-time sync.',
      priority: 'High',
      date: '2026-11-14',
      status: 'todo',
    }

    const nextState = taskReducer(initialState, {
      type: 'ADD_TASK',
      payload: newTask,
    })

    expect(nextState.tasks).toHaveLength(4)
    expect(nextState.tasks[3]).toEqual(newTask)
    expect(initialState.tasks).toHaveLength(3) // immutability check
  })

  it('should update an existing task with EDIT_TASK', () => {
    const initialState: TaskState = { tasks: sampleTasks }
    const updatedTask: Task = {
      ...sampleTasks[0],
      title: 'Design updated login page',
      priority: 'Medium',
    }

    const nextState = taskReducer(initialState, {
      type: 'EDIT_TASK',
      payload: updatedTask,
    })

    const found = nextState.tasks.find(t => t.id === 1)
    expect(found?.title).toBe('Design updated login page')
    expect(found?.priority).toBe('Medium')
    expect(nextState.tasks.find(t => t.id === 2)?.title).toBe('Setup project structure')
  })

  it('should remove a task with DELETE_TASK', () => {
    const initialState: TaskState = { tasks: sampleTasks }

    const nextState = taskReducer(initialState, {
      type: 'DELETE_TASK',
      payload: 2,
    })

    expect(nextState.tasks).toHaveLength(2)
    expect(nextState.tasks.some(t => t.id === 2)).toBe(false)
  })

  it('should move a task status with MOVE_TASK', () => {
    const initialState: TaskState = { tasks: sampleTasks }

    const nextState = taskReducer(initialState, {
      type: 'MOVE_TASK',
      payload: { id: 1, status: 'done' },
    })

    const moved = nextState.tasks.find(t => t.id === 1)
    expect(moved?.status).toBe('done')
  })

  it('should restore previous state with RESTORE_STATE for optimistic update rollback', () => {
    const previousState: TaskState = { tasks: sampleTasks }

    // User optimistically moves a task
    const optimisticState = taskReducer(previousState, {
      type: 'MOVE_TASK',
      payload: { id: 1, status: 'done' },
    })
    expect(optimisticState.tasks.find(t => t.id === 1)?.status).toBe('done')

    // On simulated sync error or network failure, rollback:
    const rolledBackState = taskReducer(optimisticState, {
      type: 'RESTORE_STATE',
      payload: previousState,
    })

    expect(rolledBackState.tasks.find(t => t.id === 1)?.status).toBe('todo')
    expect(rolledBackState.tasks).toEqual(sampleTasks)
  })

  it('should return the current state for unrecognized actions', () => {
    const initialState: TaskState = { tasks: sampleTasks }
    // @ts-expect-error testing unknown action
    const nextState = taskReducer(initialState, { type: 'UNKNOWN_ACTION' } as TaskAction)

    expect(nextState).toBe(initialState)
  })
})

