const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const emailSentTests = require('./emailSentTests')

emailSentTests(lab, {
  pageHeading: 'We have resent the email - check again',
  routePath: '/save-return/email-sent-resent',
  nextRoutePath: '/task-list',
  resentPath: '/save-return/email-sent-resent',
  errorPath: '/errors/technical-problem'
})
