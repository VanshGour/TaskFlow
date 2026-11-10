export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting'

export type MessageHandler = (data: any) => void
export type StatusHandler = (status: ConnectionState) => void

class TaskSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private baseReconnectDelay = 1000
  private maxReconnectDelay = 8000
  private reconnectTimer: number | null = null
  private messageListeners = new Set<MessageHandler>()
  private statusListeners = new Set<StatusHandler>()
  private currentStatus: ConnectionState = 'disconnected'
  private isExplicitlyClosed = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.connect()
    }
  }

  private getSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    // If running in development with Vite proxy, use /ws
    // Otherwise fallback to port 3001 if on localhost
    if (window.location.port === '5173' || window.location.port === '3000') {
      return `${protocol}//${window.location.host}/ws`
    }
    return `${protocol}//${window.location.hostname}:3001`
  }

  private updateStatus(status: ConnectionState) {
    this.currentStatus = status
    this.statusListeners.forEach(listener => {
      try {
        listener(status)
      } catch (err) {
        console.error('Status listener error:', err)
      }
    })
  }

  public getStatus(): ConnectionState {
    return this.currentStatus
  }

  public connect(): void {
    if (typeof window === 'undefined') return
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return
    }

    this.isExplicitlyClosed = false
    this.updateStatus(this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting')

    try {
      const url = this.getSocketUrl()
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        console.log('[TaskSocket] Connected to real-time sync server')
        this.reconnectAttempts = 0
        this.updateStatus('connected')
      }

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(String(event.data))
          this.messageListeners.forEach(listener => {
            try {
              listener(parsed)
            } catch (err) {
              console.error('[TaskSocket] Message listener error:', err)
            }
          })
        } catch (error) {
          console.error('[TaskSocket] Could not parse incoming WebSocket message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('[TaskSocket] WebSocket connection closed')
        this.updateStatus('disconnected')
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect()
        }
      }

      this.ws.onerror = (error) => {
        console.warn('[TaskSocket] WebSocket encountered an error:', error)
        // onclose will trigger next and handle reconnection
      }
    } catch (err) {
      console.warn('[TaskSocket] Failed to create WebSocket connection:', err)
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer !== null) return
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('[TaskSocket] Max reconnect attempts reached. Waiting for user action or network change.')
      return
    }

    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(1.5, this.reconnectAttempts),
      this.maxReconnectDelay
    )
    this.reconnectAttempts++
    this.updateStatus('reconnecting')

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, delay)
  }

  public send(data: unknown): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false
    }

    try {
      this.ws.send(JSON.stringify(data))
      return true
    } catch (error) {
      console.error('[TaskSocket] Error sending message:', error)
      return false
    }
  }

  public onMessage(listener: MessageHandler): () => void {
    this.messageListeners.add(listener)
    return () => this.messageListeners.delete(listener)
  }

  public onStatusChange(listener: StatusHandler): () => void {
    this.statusListeners.add(listener)
    listener(this.currentStatus)
    return () => this.statusListeners.delete(listener)
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.updateStatus('disconnected')
  }
}

export const taskSocket = new TaskSocketClient()
export default taskSocket
