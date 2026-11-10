import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getTasks, saveTasks } from './db'
import type { Task } from './types'

const dummyTasks: Task[] = [
  {
    id: 101,
    title: 'Offline DB Persistence Test',
    description: 'Verifying fallback storage operations.',
    priority: 'High',
    date: '2026-11-10',
    status: 'todo',
  },
]

describe('IndexedDB Persistence Layer Fallback', () => {
  const store = new Map<string, string>()

  beforeEach(() => {
    store.clear()
    const mockStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, String(value)),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      length: 0,
    }
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockStorage,
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    store.clear()
  })

  it('should fall back to localStorage when indexedDB is not available', async () => {
    await saveTasks(dummyTasks)
    const stored = await getTasks()

    expect(stored).toEqual(dummyTasks)
  })

  it('should return empty list when no tasks are saved in fallback storage', async () => {
    store.clear()
    const stored = await getTasks()

    expect(stored).toEqual([])
  })
})
