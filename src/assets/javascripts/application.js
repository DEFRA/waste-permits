/* global $ */

$(window).on('load', function () {
  // If there is an error summary, set the focus to the summary
  if ($('.error-summary').length) {
    $('.error-summary').focus()
  }
})
