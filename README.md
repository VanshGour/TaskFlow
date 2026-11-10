# TaskFlow – Offline-First Real-Time Task Board

A modern, high-performance Kanban board built with **React**, **TypeScript**, **IndexedDB**, and **WebSockets**. TaskFlow delivers an offline-first experience with instant optimistic state transitions, automatic rollback recovery, real-time multi-tab synchronization, and comprehensive screen-reader / keyboard accessibility.

---

## Key Highlights & Features

- **Typed Reducer Architecture**: State transitions (`ADD_TASK`, `EDIT_TASK`, `DELETE_TASK`, `MOVE_TASK`, `RESTORE_STATE`) are strongly typed and managed deterministically via `useReducer`.
- **Optimistic Updates with Automatic Rollback**: Actions reflect instantly in the UI. If a synchronization or network error occurs, state automatically rolls back to the previous snapshot using `RESTORE_STATE`, with live visual and screen-reader status notifications. Includes a built-in simulation toggle to test and demonstrate rollback behavior.
- **Full Keyboard Accessibility & ARIA Live Announcements**:
  - Focusable cards with full keyboard navigation:
    - `←` or `[`: Move card to the previous column.
    - `→` or `]`: Move card to the next column.
    - `Enter` or `e`: Edit task.
    - `Delete` or `Backspace`: Delete task.
    - `Tab` / `Shift + Tab`: Seamless focus traversal.
    - `Esc`: Close modals.
  - Screen reader announcements using `aria-live="polite"` (and `aria-live="assertive"` for rollback alerts) via `LiveAnnouncer`.
- **Offline-First Persistence**:
  - **IndexedDB**: Persistent local database storing full task history.
  - **Service Worker (`sw.js`)**: Caches static assets, scripts, and HTML shell for offline availability.
  - **Online/Offline Awareness**: Dynamic UI badges reflecting connection mode (`Offline (IndexedDB)`, `Live Sync Connected`, `Reconnecting...`, `Local Mode`).
- **Real-Time Multi-Tab Sync with Auto-Reconnect**:
  - Node.js WebSocket server (`server/index.js`) broadcasting updates across active tabs and clients.
  - Custom `TaskSocketClient` featuring exponential backoff auto-reconnect logic and event subscription handling.
- **Vitest Unit Test Suite**: Comprehensive state logic unit tests covering reducer operations, immutability, and optimistic rollback restoration.

---

## Project Structure

```
taskflow/
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── sw.js               # Service Worker for offline asset caching
├── server/
│   └── index.js            # Node.js WebSocket broadcast server
├── src/
│   ├── components/
│   │   ├── Column.tsx          # Kanban column drop zone & task listing
│   │   ├── Header.tsx          # Top bar, stats, sim toggle & add button
│   │   ├── LiveAnnouncer.tsx   # ARIA live announcements & toast alerts
│   │   ├── ShortcutsModal.tsx  # Keyboard shortcuts guide dialog
│   │   ├── Sidebar.tsx         # Navigation tabs & workspace profile
│   │   ├── TaskCard.tsx        # Keyboard-accessible draggable card
│   │   └── TaskModal.tsx       # Accessible Add / Edit task modal
│   ├── App.css             # Polished Kanban & responsive design system
│   ├── App.tsx             # Root orchestration & optimistic update logic
│   ├── db.ts               # IndexedDB persistence layer with fallback
│   ├── main.tsx            # Entry point & Service Worker registration
│   ├── socket.ts           # WebSocket client with auto-reconnect backoff
│   ├── taskReducer.ts      # Strongly typed state reducer
│   ├── taskReducer.test.ts # Vitest unit test suite for state logic
│   └── types.ts            # TypeScript interfaces & domain types
├── package.json
├── tsconfig.json
└── vite.config.js
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

### 3. Start the WebSocket Sync Server
```bash
npm run server
```

### 4. Run Vitest Unit Tests
```bash
npm run test
```

### 5. Build for Production
```bash
npm run build
```
