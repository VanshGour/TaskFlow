
import type { Task, TaskStatus } from './types'

export interface TaskState {
  tasks: Task[]
}

export type TaskAction =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'EDIT_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: number }
  | {
      type: 'MOVE_TASK'
      payload: { id: number; status: TaskStatus }
    }
  | { type: 'RESTORE_STATE'; payload: TaskState }

export function taskReducer(
  
  state: TaskState,
  action: TaskAction
): TaskState {

  switch (action.type) {

    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload]
      }

    case 'EDIT_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? action.payload
            : task
        )
      }

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(
          task => task.id !== action.payload
        )
      }

    case 'MOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, status: action.payload.status }
            : task
        )
      }

    case 'RESTORE_STATE':
      return action.payload

      case 'RESTORE_STATE':
  return action.payload

    default:
      return state
  }
}
