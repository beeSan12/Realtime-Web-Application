/**
 * @file Defines the main router.
 * @module router
 * @author Mats Loock & Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import express from 'express'
import http from 'http'
import { router as homeRouter } from './homeRouter.js'
import webhooksRouter from './webhooksRouter.js'
import { router as issuesRouter } from './issuesRouter.js'

export const router = express.Router()

router.use('/', homeRouter)
router.use('/issues', issuesRouter)
router.use('/webhooks', webhooksRouter)

// Catch 404 (ALWAYS keep this as the last route).
router.use('*', (req, res, next) => {
  const statusCode = 404
  const error = new Error(http.STATUS_CODES[statusCode])
  error.status = statusCode
  next(error)
})
