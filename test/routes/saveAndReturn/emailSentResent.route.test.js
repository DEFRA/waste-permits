const Lab = require('lab')
const lab = exports.lab = Lab.script()
const emailSentTests = require('./emailSentTests')

emailSentTests(lab, {
  pageHeading: 'We’ve resent the email - check again',
  routePath: '/save-return/email-sent-resent',
  nextRoutePath: '/task-list',
  errorPath: '/errors/technical-problem'
})
