/**
 * @file Defines the webhook router.
 * @module routes/webhooksRouter
 * @author Mats Loock
 * @version 3.0.0
 */

import express from 'express'
import { WebhooksController } from '../controllers/WebhooksController.js'

export const router = express.Router()

const controller = new WebhooksController()

// Map HTTP verbs and route paths to controller actions.
router.post('/',
  (req, res, next) => controller.verifyToken(req, res, next),
  (req, res, next) => controller.indexPost(req, res, next)
)

export default router
