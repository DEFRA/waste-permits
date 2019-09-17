const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const emailSentTests = require('./checkYourEmailTests')

emailSentTests(lab, {
  pageHeading: 'Search for ‘environmental permit application’ in your emails',
  routePath: '/save-return/search-your-email',
  nextPath: '/save-return/check-your-email',
  resentPath: '/save-return/email-sent-resent',
  excludeAlreadySubmittedTest: true
})
