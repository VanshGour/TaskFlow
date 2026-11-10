interface SidebarProps {
  activePage: string
  setActivePage: (page: string) => void
  onOpenShortcuts: () => void
}

export function Sidebar({
  activePage,
  setActivePage,
  onOpenShortcuts,
}: SidebarProps) {
  const navItems = [
    { name: 'My Board', icon: '▦' },
    { name: 'Upcoming', icon: '◷' },
    { name: 'Completed', icon: '✓' },
  ]

  return (
    <aside className="sidebar" aria-label="Sidebar Navigation">
      <h1 className="logo">
        Task<span>Flow.</span>
      </h1>

      <p className="nav-label">WORKSPACE</p>

      <nav className="sidebar-nav" aria-label="Workspace views">
        {navItems.map(item => (
          <button
            key={item.name}
            type="button"
            className={`nav-item ${activePage === item.name ? 'active' : ''}`}
            onClick={() => setActivePage(item.name)}
            aria-current={activePage === item.name ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="shortcuts-hint-box">
        <button
          type="button"
          className="shortcuts-pill-btn"
          onClick={onOpenShortcuts}
          aria-label="View keyboard shortcuts guide"
        >
          <span aria-hidden="true">⌨️</span> Keyboard Shortcuts
        </button>
      </div>

      <div className="sidebar-bottom">
        <div className="avatar large" aria-hidden="true">
          VG
        </div>
        <div>
          <strong>Vansh Gour</strong>
          <p>My Workspace</p>
        </div>
      </div>
    </aside>
  )
}

