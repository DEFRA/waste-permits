/* global $, GOVUK */
/* eslint-disable */

$(window).on('load', function () {
  // If there is an error summary, set the focus to the summary
  if ($('.error-summary').length) {
    $('.error-summary').focus()
  }
})

function uploadFilePanel () {
  var pageBusy = false
  var $uploadFilePanel = $('#upload-file-panel')

  var setBusy = function () {
    pageBusy = true
    $uploadFilePanel.find('#submit-button').css('cursor', 'progress')
    $uploadFilePanel.find('.remove-file-link').css('cursor', 'progress')
    $uploadFilePanel.find('input').css('cursor', 'progress')
  }

  var skipIfBusy = function (e) {
    if (pageBusy) {
      e.preventDefault()
    }
  }

  var onUpload = function (e) {
    e.preventDefault()
    if (!pageBusy) {
      setBusy()
      $('#uploadForm').submit()
    }
  }

  var removeFile = function (e) {
    e.preventDefault()
    if (!pageBusy) {
      setBusy()
      window.location.href = $(this).attr('href')
    }
  }

  $uploadFilePanel.find('#submit-button').click(onUpload)
  $uploadFilePanel.find('.remove-file-link').click(removeFile)
  $uploadFilePanel.find('input').click(skipIfBusy)
}

$(document).ready(function () {
  // Remove the no-js class if the user has Javascript available. This will show any elements
  // on the page that should only be visible when Javascript is available.
  $('.no-js').removeClass('no-js')

  // Show and hide toggled content
  // Where .multiple-choice uses the data-target attribute to toggle hidden content
  var showHideContent = new GOVUK.ShowHideContent()
  showHideContent.init()

  // don't allow user interaction while an upload or remove is in progress
  uploadFilePanel()
})

GOVUK.details.init()
