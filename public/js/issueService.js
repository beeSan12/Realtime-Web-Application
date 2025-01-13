document.addEventListener('DOMContentLoaded', () => {
  console.log('issueService.js is loaded')

  const urlParams = new URLSearchParams(window.location.search)
  const issueIid = urlParams.get('issueIid')

  if (issueIid) {
    fetch(`./issues/${issueIid}`)
      .then(response => response.json())
      .then(data => {
        document.getElementById('issueIdInput').value = data.iid
        document.getElementById('titleInput').value = data.title
        document.getElementById('descriptionInput').value = data.description
        document.getElementById('stateInput').value = data.state
        // Update form action to include issue ID
        document.getElementById('updateIssueForm').action = `/issues/${data.iid}/update`

        const closeButton = document.getElementById('closeButton')
        const reopenButton = document.getElementById('openButton')
        if (data.state === 'closed') {
          closeButton.style.display = 'none'
          reopenButton.style.display = 'block'
        } else {
          reopenButton.style.display = 'none'
          closeButton.style.display = 'block'
        }

        if (closeButton) {
          closeButton.addEventListener('click', function (event) {
            event.preventDefault()
            submitForm('close')
          })
        }
        if (reopenButton) {
          reopenButton.addEventListener('click', function (event) {
            event.preventDefault()
            submitForm('reopen')
          })
        }
      })
      .catch(error => console.error('Error:', error))

    /**
     * Sets the action and submits the form.
     *
     * @param {string} action - The action to perform ('update' or 'close').
     */
    function submitForm (action) {
    // Clear the action input
      document.getElementById('actionInput').value = ''
      // Set the action
      document.getElementById('actionInput').value = action
      const form = document.getElementById('updateIssueForm')
      submitUpdateForm(form, document.getElementById('issueIdInput').value)
    }

    /**
     * Submits the update form for an issue.
     *
     * @param {HTMLFormElement} form - The update form.
     * @param {string} issueIid - The ID of the issue to update.
     */
    function submitUpdateForm (form, issueIid) {
      const formData = new FormData(form)
      const updatedData = Object.fromEntries(formData.entries())
      updateIssue(issueIid, updatedData, formData.get('action'))
    }

    /**
     * Updates an issue on the server.
     *
     * @param {string} issueIid - The ID of the issue to update.
     * @param {object} updatedData - The updated issue data.
     * @param {string} action - The action to perform ('update' or 'close').
     */
    function updateIssue (issueIid, updatedData, action) {
      updatedData.action = action

      fetch(`./issues/${issueIid}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok')
          }
          return response.json()
        })
        .then(data => {
          console.log('Success:', data)
        })
        .catch((error) => {
          console.error('Error:', error)
        })
    }
  }
})
