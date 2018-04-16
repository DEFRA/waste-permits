const Lab = require('lab')
const lab = exports.lab = Lab.script()
const emailSentTests = require('./checkYourEmailTests')

emailSentTests(lab, {
  pageHeading: 'Check your email',
  routePath: '/save-return/check-your-email',
  nextPath: '/save-return/check-your-email',
  errorPath: '/errors/technical-problem'
})
