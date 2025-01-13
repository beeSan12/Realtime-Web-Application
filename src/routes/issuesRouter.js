/**
 * @file Defines the issues router.
 * @module issuesRouter
 * @author Mats Loock & Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import express from 'express'
import { IssueController } from '../controllers/IssueController.js'

export const router = express.Router()

const controller = new IssueController()

router.get('/', (req, res, next) => controller.findAll(req, res, next))
router.param('iid', (req, res, next) => controller.find(req, res, next))
router.get('/create', (req, res, next) => controller.create(req, res, next))
router.post('/create', (req, res, next) => controller.createPost(req, res, next))
router.get('/:iid/update', (req, res, next) => controller.update(req, res, next))
router.post('/:iid/update', (req, res, next) => controller.updatePost(req, res, next))

export default router
