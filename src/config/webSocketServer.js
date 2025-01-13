/**
 * @file This module contains the setup of the WebSocket server.
 * @module config/webSocketServer
 * @author Mats Loock
 * @version 1.0.0
 */

import { Server as SocketIOServer } from 'socket.io'
import { logger } from './winston.js'
import webhooksRouter from '../routes/webhooksRouter.js'

/**
 * Sets up and configures the Socket.IO server on the provided HTTP server.
 *
 * @param {import('http').Server} httpServer - The HTTP server instance to attach the Socket.IO server to.
 * @returns {import('socket.io').Server} The Socket.IO server instance.
 */
export function setupWebSocketServer (httpServer) {
  const io = new SocketIOServer(httpServer)
  io.on('connection', socket => {
    logger.silly('Socket.IO: a user connected')
    console.log(`New client connected with id: ${socket.id}`)

    // Use Socket.IO events here.
    socket.on('disconnect', reason => {
      logger.silly('Socket.IO: a user disconnected')
      console.log(`Client with id ${socket.id} disconnected: ${reason}`)
    })

    socket.on('error', error => {
      logger.error('Socket.IO: error', { error })
      console.error(`Error on socket with id ${socket.id}:`, error)
    })

    socket.on('message', message => {
      try {
        logger.silly(`Socket.IO: received message: ${message}`)
        console.log(`Socket.IO: received message: ${message}`)
        const { type, data } = JSON.parse(message)
        // ---------------------------------------------------------------------------
        // 💡 If you want the server to handle messages from clients, it's a good
        //    idea to implement WebSocket routing to select the controller, and
        //    method, to handle received messages.
        // ---------------------------------------------------------------------------
        webhooksRouter.routeMessage(type, data, socket)
      } catch (error) {
        logger.error('Error parsing Socket.IO message:', { error, message })
        socket.emit('error', JSON.stringify({ error: 'Invalid message format' }))
      }
    })
  })

  return io
}
