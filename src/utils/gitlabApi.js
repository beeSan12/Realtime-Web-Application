/**
 * @file Defines the gitlabApi module.
 * @module gitlabApi
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import axios from 'axios'

const apiBaseURL = process.env.GITLAB_API_BASE_URL
const GITLAB_TOKEN = process.env.GITLAB_TOKEN
const projectId = process.env.GITLAB_PROJECT_ID

/**
 * Fetches the issues for a project.
 *
 * @returns {Promise<object[]>} The list of issues.
 */
export async function fetchIssues () {
  const url = `${apiBaseURL}${projectId}/issues`

  console.log(`Request URL: ${url}`)
  try {
    const response = await axios.get(url, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${GITLAB_TOKEN}` }
    })
    return response.data // The list of issues
  } catch (error) {
    console.error('Error fetching issues from GitLab:', error)
    throw error
  }
}

/**
 * Fetches a specific issue.
 *
 * @param {number|string} projectId - The ID of the project to fetch the issue from.
 * @param {number|string} issueIid - The ID of the issue to fetch.
 * @returns {Promise<object>} The issue.
 */
export async function fetchIssue (projectId, issueIid) {
  const url = `${apiBaseURL}${projectId}/issues/${issueIid}`

  try {
    const response = await axios.get(url, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${GITLAB_TOKEN}` }
    })
    return response.data // The issue
  } catch (error) {
    console.error(`Error fetching issue ${issueIid} from GitLab:`, error)
    throw error
  }
}

/**
 * Creates a new issue in GitLab.
 *
 * @param {object} data - The issue data.
 * @returns {Promise<object>} The created issue.
 */
export async function createIssue (data) {
  const url = `${apiBaseURL}${projectId}/issues`
  console.log(`Request URL: ${url}`)

  try {
    const response = await axios.post(url, data, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${GITLAB_TOKEN}` }
    })
    return response.data // The created issue
  } catch (error) {
    console.error('Error creating issue in GitLab:', error)
    throw error
  }
}

/**
 * Updates the issue with the given ID.
 *
 * @param {number} issueIid - The ID of the issue to update.
 * @param {object} data - The new issue data.
 * @returns {Promise<object>} The updated issue.
 */
export async function updateIssue (issueIid, data) {
  const url = `${apiBaseURL}${projectId}/issues/${issueIid}`

  try {
    const response = await axios.put(url, data, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${GITLAB_TOKEN}` }
    })
    return response.data
  } catch (error) {
    console.error(`Error updating issue ${issueIid} in GitLab:`, error)
    throw error
  }
}

export default { fetchIssues, createIssue, updateIssue }
