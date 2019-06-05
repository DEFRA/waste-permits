const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const emailSentTests = require('./checkYourEmailTests')

emailSentTests(lab, {
  pageHeading: 'Search for ’standard rules permit application’ in your emails',
  routePath: '/save-return/search-your-email',
  nextPath: '/save-return/check-your-email',
  resentPath: '/save-return/email-sent-resent',
  errorPath: '/errors/technical-problem',
  excludeAlreadySubmittedTest: true
})
