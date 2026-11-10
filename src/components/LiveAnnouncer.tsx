import { memo } from 'react'

interface LiveAnnouncerProps {
  message: string
  isError?: boolean
}

export const LiveAnnouncer = memo(function LiveAnnouncer({
  message,
  isError = false,
}: LiveAnnouncerProps) {
  return (
    <>
      {/* Accessible screen-reader live announcements */}
      <div
        className="sr-only"
        role="status"
        aria-live={isError ? 'assertive' : 'polite'}
        aria-atomic="true"
      >
        {message}
      </div>

      {/* Visible toast notification banner */}
      {message && (
        <div
          className={`toast-notification ${isError ? 'toast-error' : 'toast-info'}`}
          role="status"
        >
          <span className="toast-icon">{isError ? '⚠️' : '🔔'}</span>
          <span className="toast-text">{message}</span>
        </div>
      )}
    </>
  )
})

