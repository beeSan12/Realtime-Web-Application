// ----------------------------------------------------------------------------
// Handles the "active" class on the navigation links.

//
document.addEventListener('DOMContentLoaded', () => {
  console.log('index.js is loaded')

  // Make all currently active items inactive.
  document.querySelectorAll('a.nav-link.active').forEach((a) => {
    a.classList.remove('active')
    a.attributes.removeNamedItem('aria-current')
  })

  // Find the link to the current page and make it active.
  document.querySelectorAll(`a[href$="${location.pathname}"].nav-link`).forEach((a) => {
    a.classList.add('active')
    a.setAttribute('aria-current', 'page')
  })

  // ----------------------------------------------------------------------------
  // Toggle display of additional information
  //
  const toggleButton = document.getElementById('toggleWorkoutInfo')
  const infoDiv = document.querySelector('.info-workout')

  if (toggleButton && infoDiv) {
    toggleButton.addEventListener('click', () => {
      infoDiv.style.display = infoDiv.style.display === 'none' || !infoDiv.style.display ? 'block' : 'none'
    })
  }
})
