import type { ConnectionState } from '../socket'

interface HeaderProps {
  activePage: string
  connectionStatus: ConnectionState
  isOnline: boolean
  isSyncing: boolean
  simulateFailure: boolean
  onToggleSimulateFailure: () => void
  onAddTask: () => void
}

export function Header({
  activePage,
  connectionStatus,
  isOnline,
  isSyncing,
  simulateFailure,
  onToggleSimulateFailure,
  onAddTask,
}: HeaderProps) {
  function renderConnectionBadge() {
    if (!isOnline) {
      return (
        <span className="badge-status badge-offline" title="Working offline with IndexedDB">
          <span className="dot dot-offline" /> Offline (IndexedDB)
        </span>
      )
    }

    switch (connectionStatus) {
      case 'connected':
        return (
          <span className="badge-status badge-connected" title="Real-time multi-tab sync active">
            <span className="dot dot-connected" /> Live Sync Connected
          </span>
        )
      case 'reconnecting':
        return (
          <span className="badge-status badge-reconnecting" title="Attempting auto-reconnect">
            <span className="dot dot-reconnecting" /> Reconnecting...
          </span>
        )
      default:
        return (
          <span className="badge-status badge-local" title="Changes saved to IndexedDB">
            <span className="dot dot-local" /> Local Mode (IndexedDB)
          </span>
        )
    }
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      <header className="topbar">
        <span>Workspace / {activePage}</span>
        <div className="topbar-right">
          {renderConnectionBadge()}
          <span className="today">{currentDate}</span>
        </div>
      </header>

      <section className="board-header">
        <div>
          <p className="welcome">WELCOME BACK 👋</p>
          <h1>{activePage === 'My Board' ? 'My Tasks' : activePage}</h1>
          <p className="subtitle">Organize your work and get things done.</p>
        </div>

        <div className="board-actions">
          <button
            type="button"
            className={`simulate-btn ${simulateFailure ? 'active' : ''}`}
            onClick={onToggleSimulateFailure}
            title="When active, next task update will simulate a sync error to test optimistic rollback"
            aria-pressed={simulateFailure}
          >
            {simulateFailure ? '⚡ Sync Failure Sim: ON' : '⚡ Sim Rollback'}
          </button>

          <span className="sync-status" aria-live="polite">
            {isSyncing ? 'Syncing...' : 'All changes saved'}
          </span>

          <button
            type="button"
            className="add-task-btn"
            onClick={onAddTask}
            aria-label="Add new task"
          >
            + Add Task
          </button>
        </div>
      </section>
    </>
  )
}

