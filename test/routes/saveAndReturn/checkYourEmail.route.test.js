const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const emailSentTests = require('./checkYourEmailTests')

emailSentTests(lab, {
  pageHeading: 'Check your email',
  routePath: '/save-return/check-your-email',
  nextPath: '/save-return/check-your-email',
  resentPath: '/save-return/email-sent-resent',
  excludeAlreadySubmittedTest: true
})
