/* global $ */

$(window).on('load', function () {
  // If there is an error summary, set the focus to the summary
  if ($('.error-summary').length) {
    $('.error-summary').focus()
  }
})

$(document).ready(function () {
  // Remove the no-js class if the user has Javascript available. This will show any elements
  // on the page that should only be visible when Javascript is available.
  $('.no-js').removeClass('no-js')
})
