
import type { Task } from './types'

const DB_NAME = 'TaskFlowDB'
const STORE_NAME = 'tasks'
const DB_VERSION = 1

// Open the database
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: 'id'
        })
      }
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

// Save all tasks
export async function saveTasks(tasks: Task[]): Promise<void> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    store.clear()

    tasks.forEach(task => {
      store.put(task)
    })

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
}

// Get all saved tasks
export async function getTasks(): Promise<Task[]> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)

    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result as Task[])
    }

    request.onerror = () => {
      reject(request.error)
    }

    transaction.oncomplete = () => {
      db.close()
    }

    transaction.onerror = () => {
      db.close()
      reject(transaction.error)
    }
  })
}
    