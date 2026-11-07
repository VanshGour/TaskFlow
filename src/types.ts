
export type TaskStatus = 'todo' | 'progress' | 'done'

export type TaskPriority = 'High' | 'Medium' | 'Low'

export interface Task {
  id: number
  title: string
  description: string
  priority: TaskPriority
  date: string
  status: TaskStatus
}

