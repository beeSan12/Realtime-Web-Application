/**
 * @file Defines the WebhookController class.
 * @module controllers/WebhooksController
 * @author Mats Loock & Beatriz Sanssi <bs222eh@student.lnu.se>
 * @version 3.1.0
 */

import { logger } from '../config/winston.js'
import IssuesModel from '../models/issuesModel.js'

/**
 * Encapsulates a controller.
 */
export class WebhooksController {
  /**
   * Receives a webhook, and creates a new snippet.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @returns {void}
   */
  async indexPost (req, res) {
    try {
      // Quick acknowledgment
      res.status(200).send('Webhook received')
      const payload = req.body

      const io = req.app.get('io')
      // Extract the project ID from the request body
      const projectId = req.body.project?.id
      console.log(`Received a webhook for project ID: ${projectId}`)

      // Only process the webhook if the event type is 'issue'; ignore other event types.
      if (payload.event_type !== 'issue') {
        logger.silly('webhook (invalid event)', { event_type: payload.event_type })
        return
      }

      // Take care of the received payload.
      await this.#processPayload(req.body, io)

      logger.silly('webhook (recived)', { payload })
    } catch (error) {
      // Log the error but nothing more (a response has already been sent)!
      logger.error(error.message, { error })
    }
  }

  /**
   * Verifies the webhook.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {void}
   */
  verifyToken (req, res, next) {
    // Use the GitLab secret token to validate the received payload.
    if (req.headers['x-gitlab-token'] !== process.env.WEBHOOK_SECRET) {
      logger.info('webhook (invalid token)', {
        'x-gitlab-token': req.headers['x-gitlab-token']
      })
      res.status(401).send('Invalid token')
      return
    }
    console.log('Webhook verified')
    next()
  }

  /**
   * Processes the received webhook payload.
   *
   * @param {object} payload - The received payload.
   * @param {io} io - The WebSocket server.
   */
  async #processPayload (payload, io) {
    const eventType = payload.event_type
    const { title, description, stateEvent, iid, id } = payload.object_attributes
    const { id: author, avatar_url: avatar } = payload.user
    const projectId = payload.project.id
    // This may take some time...
    // Create (and save) a new snippet (because in this particular case, an issue title
    // is seen as a snippet), transform it, and broadcast it to all clients.
    try {
      if (eventType !== 'issue') {
        logger.silly('Ignoring non-issue event', { eventType })
        return
      }
      let issueDocument = await IssuesModel.findOne({ projectId, iid })

      if (issueDocument) {
        // If the issue exists, update it
        issueDocument.title = title
        issueDocument.description = description
        issueDocument.author = author
        issueDocument.avatar = avatar
        issueDocument.projectId = projectId
        issueDocument.iid = iid
        issueDocument.state_event = stateEvent
        issueDocument.id = id

        await issueDocument.save()
        console.log('Issue updated:', issueDocument)

        // Prepare the data for WebSocket broadcast for an update
        const data = JSON.stringify({
          type: 'issues/update',
          data: issueDocument.toObject()
        })
        // this.#broadcastToClients(wss, data)
        this.#broadcastToClients(io, data)
      } else {
        issueDocument = await IssuesModel.create({
          title,
          description,
          author,
          avatar,
          projectId,
          iid,
          stateEvent,
          id
        })
        console.log('Issue created:', issueDocument)
      }

      // Prepare the data for WebSocket broadcast for a create
      const data = {
        type: 'issues/create', // Consider renaming this type if it includes updates.
        data: issueDocument.toObject()
      }

      console.log('Webhook processed', data)
      this.#broadcastToClients(io, data)
      console.log('Webhook broadcasted', data)
    } catch (error) {
      logger.error(error.message, { error })
    }
  }

  /**
   * Broadcasts data to all clients.
   *
   * @param {io} io - The WebSocket server.
   * @param {string} data - The data to broadcast.
   */
  #broadcastToClients (io, data) {
    // Emit data to all connected clients
    console.log('Broadcasting data: ', data)
    io.emit('broadcastEvent', JSON.stringify({ data }))
  }
}
