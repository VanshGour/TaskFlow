import { WebSocketServer, WebSocket } from 'ws'

const PORT = 3001

const wss = new WebSocketServer({ port: PORT })

wss.on('connection', (socket) => {
  console.log('Client connected')

  socket.on('message', (rawMessage) => {
    try {
      const message = JSON.parse(rawMessage.toString())

      if (!message || typeof message !== 'object' || !message.type) {
        return
      }

      // Allow TASK_UPDATED and individual task reducer action broadcasts
      if (
        message.type !== 'TASK_UPDATED' &&
        !message.type.startsWith('TASK_') &&
        message.type !== 'RESTORE_STATE'
      ) {
        return
      }

      // Send the update to every other connected client
      let broadcastCount = 0
      wss.clients.forEach((client) => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message))
          broadcastCount++
        }
      })

      console.log(`Broadcasted [${message.type}] to ${broadcastCount} client(s)`)
    } catch (error) {
      console.error('Invalid message received:', error)
    }
  })

  socket.on('close', () => {
    console.log('Client disconnected')
  })

  socket.on('error', (error) => {
    console.error('WebSocket error:', error)
  })
})

console.log(`TaskFlow WebSocket server running on port ${PORT}`)
