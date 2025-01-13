/**
 * @file Defines the IssuesController class.
 * @module IssueController
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 * @version 3.1.0
 */

import { logger } from '../config/winston.js'
import { fetchIssues, fetchIssue, createIssue, updateIssue } from '../utils/gitlabApi.js'

/**
 * Encapsulates a controller.
 */
export class IssueController {
  /**
   * Sends a JSON response containing an issue.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>} - A promise that resolves when the response is sent.
   */
  async find (req, res, next) {
    const { iid: issueIid } = req.params
    const projectId = process.env.GITLAB_PROJECT_ID

    if (!projectId) {
      console.error('Project ID is not defined. Please check your environment variables.')
      return res.status(500).json({ error: 'Internal Server Error due to missing project ID' })
    }

    try {
      const issueData = await fetchIssue(projectId, issueIid)
      req.issueData = issueData
      if (!issueData) {
        return res.status(404).json({ error: 'Issue not found' })
      }
      logger.silly('Loaded issue document', { issueIid, issueData })
      next()
    } catch (error) {
      console.error(error)
      next(error)
    }
  }

  /**
   * Sends a JSON response containing all issues.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async findAll (req, res, next) {
    try {
      logger.silly('Loading all issue documents')

      const issues = await fetchIssues()

      logger.silly('Loaded all issue documents')

      res.render('issues/index', { issues })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Returns a HTML form for creating a new issue.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>} - A promise that resolves when the issue is created.
   */
  async create (req, res, next) {
    res.render('issues/create')
    console.log('issue created:', req.issueData)
  }

  /**
   * Creates a new issue.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>} - A promise that resolves when the issue is created.
   */
  async createPost (req, res, next) {
    try {
      const newIssueData = req.body
      const newIssue = await createIssue(newIssueData)
      req.session.flash = { type: 'success', text: 'You have successfully created new issue!' }
      console.log('Issue created successfully:', newIssue)
      res.redirect('.')
    } catch (error) {
      req.session.flash = { type: 'danger', text: 'Unable to create issue' }
      this.#handleErrorAndRedirect(error, res, './create')
    }
  }

  /**
   * Returns a HTML form for updating an issue.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @returns {Promise<void>} - A promise that resolves when the form is rendered.
   */
  async update (req, res) {
    try {
      if (!req.issueData) {
        return res.status(404).send('Issue not found')
      }
      // Check if the request accepts JSON
      if (req.headers.accept.includes('application/json')) {
        res.json(req.issueData) // Respond with JSON if it's an AJAX request
      } else {
        console.log('Issue to update:', req.issueData)
        res.render('issues/update', { issue: req.issueData })
      }
    } catch (error) {
      this.#handleErrorAndRedirect(error, req, res, '..')
    }
  }

  /**
   * Updates a specific issue.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async updatePost (req, res) {
    const issueIid = req.params.iid
    let action = req.body.action

    if (Array.isArray(action)) {
      console.warn(`Multiple actions received: ${action}. Choosing the last action.`)
      action = action.pop()
    }

    const updatedData = {
      title: req.body.title,
      description: req.body.description,
      state_event: action === 'reopen' ? 'reopen' : (action === 'close' ? 'close' : undefined)
    }

    console.log(`Issue IID: ${issueIid}, Action: ${action}, Updated Data:`, updatedData)
    try {
      await updateIssue(issueIid, updatedData)
      req.session.flash = { type: 'success', text: `You have successfully updated issue #${issueIid}!` }
      logger.silly('Updated issue document', { issueIid, updatedData })
      res.redirect('..')
    } catch (error) {
      req.session.flash = { type: 'danger', text: 'Unable to update issue' }
      logger.silly('Unable to update issue document', { issueIid, updatedData })

      this.#handleErrorAndRedirect(error, req, res, './update')
    }
  }

  /**
   * Handles an error and redirects to the specified path.
   *
   * @param {Error} error - The error to handle.
   * @param {object} res - Express response object.
   */
  #handleErrorAndRedirect (error, res) {
    logger.error(error.message, { error })
    res.redirect('..')
  }
}
