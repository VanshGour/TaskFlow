import type { Task } from './types'

const DB_NAME = 'TaskFlowDB'
const STORE_NAME = 'tasks'
const DB_VERSION = 1
const FALLBACK_KEY = 'taskflow_tasks_backup'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not supported'))
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  // Always update localStorage as immediate fallback
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(tasks))
    }
  } catch (err) {
    console.warn('[DB] LocalStorage backup error:', err)
  }

  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      store.clear()
      tasks.forEach(task => store.put(task))

      transaction.oncomplete = () => {
        db.close()
        resolve()
      }

      transaction.onerror = () => {
        db.close()
        reject(transaction.error)
      }

      transaction.onabort = () => {
        db.close()
        reject(transaction.error)
      }
    })
  } catch (error) {
    console.warn('[DB] IndexedDB save failed, used localStorage fallback:', error)
  }
}

export async function getTasks(): Promise<Task[]> {
  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        db.close()
        resolve((request.result as Task[]) || [])
      }

      request.onerror = () => {
        db.close()
        reject(request.error)
      }
    })
  } catch (error) {
    console.warn('[DB] IndexedDB read failed, falling back to localStorage:', error)
    try {
      if (typeof localStorage !== 'undefined') {
        const item = localStorage.getItem(FALLBACK_KEY)
        if (item) return JSON.parse(item) as Task[]
      }
    } catch (fallbackErr) {
      console.warn('[DB] LocalStorage recovery failed:', fallbackErr)
    }
    return []
  }
}
