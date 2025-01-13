console.log('webSocket.js is loaded')
const issueTemplate = document.querySelector('#issue-template')

// If taskTemplate is not present on the page, write an error message.
console.assert(issueTemplate, 'Could not find "#issue-template" template element.')

// Get the base URL for the WebSocket connection.
const base = document.querySelector('base')
const path = base ? (new URL('socket.io', base.href)).pathname : 'socket.io'

// Connect to the WebSocket server.
const socket = window.io.connect('/', { path })

// ----------------------------------------------------------------------------
// Event handlers.
//
socket.addEventListener('connect', () => {
  console.log('WebSocket connected!', socket)
})

// Listen for messages.
socket.addEventListener('broadcastEvent', (data) => {
  console.log('Received broadcast event:', data)
  if (!data) {
    console.error('No data received')
    return
  }

  try {
    const parsedData = JSON.parse(data) // Parse the JSON string into an object
    console.log('Parsed data:', parsedData)
    console.log('Parsed data type:', parsedData.data.type)

    if (parsedData && parsedData.data && parsedData.data.type === 'issues/create') {
      console.log('Inserting issue row:', parsedData.data.data)
      insertIssueRow(parsedData.data.data)
    }
  } catch (error) {
    console.error('Error parsing data:', error)
  }
})
socket.addEventListener('disconnect', (reason) => {
  console.log('WebSocket disconnected!', reason)
})

socket.addEventListener('error', (error) => {
  console.error('WebSocket error:', error)
})

// ----------------------------------------------------------------------------
// Helpers.
//

/**
 * Inserts a snippet row at the end of the issue table.
 *
 * @param {object} issue - The issue object to insert.
 */
function insertIssueRow (issue) {
  console.log('Attempting to insert issue:', issue)
  const issueList = document.querySelector('#issues-list')

  // Ensure the issue list is found
  if (!issueList) {
    console.error('Issue list element not found')
    return
  }

  // Prevent duplicate rows for the same issue
  if (issueList.querySelector(`tr[data-id="${issue.iid}"]`)) {
    console.log('Issue already exists in the list.')
    return
  }

  // Add the task to the list.
  const issueNode = issueTemplate.content.cloneNode(true)
  const row = issueNode.querySelector('tr')
  const avatarCell = issueNode.querySelector('img.avatar')
  const titleCell = issueNode.querySelector('td:nth-child(2)')
  const descriptionCell = issueNode.querySelector('td:nth-child(3)')
  const authorCell = issueNode.querySelector('td:nth-child(4)')
  const stateCell = issueNode.querySelector('td:nth-child(5)')
  const [updateLink] = issueNode.querySelectorAll('a')

  row.setAttribute('data-id', issue.iid)

  avatarCell.src = issue.avatar
  titleCell.textContent = issue.title
  descriptionCell.textContent = issue.description
  authorCell.textContent = issue.author
  stateCell.textContent = issue.state_event
  updateLink.href = `./issues/${issue.iid}/update`

  // Append the filled template to the issue list
  issueList.appendChild(row)
  console.log('Issue successfully added to the list.')
}
