interface ShortcutsModalProps {
  onClose: () => void
}

export function ShortcutsModal({ onClose }: ShortcutsModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal shortcuts-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="shortcuts-title">Keyboard Shortcuts</h2>
        <p className="modal-subtitle">
          TaskFlow is built for full keyboard accessibility with ARIA live announcements.
        </p>

        <ul className="shortcuts-list">
          <li>
            <kbd>Tab</kbd> / <kbd>Shift + Tab</kbd>
            <span>Navigate between task cards, inputs, and actions</span>
          </li>
          <li>
            <kbd>←</kbd> or <kbd>[</kbd>
            <span>Move focused card to the previous column</span>
          </li>
          <li>
            <kbd>→</kbd> or <kbd>]</kbd>
            <span>Move focused card to the next column</span>
          </li>
          <li>
            <kbd>Enter</kbd> or <kbd>e</kbd>
            <span>Open edit modal for the focused task</span>
          </li>
          <li>
            <kbd>Delete</kbd> or <kbd>Backspace</kbd>
            <span>Delete the focused task</span>
          </li>
          <li>
            <kbd>Esc</kbd>
            <span>Close active modal</span>
          </li>
        </ul>

        <div className="modal-actions">
          <button type="button" className="submit-btn" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

