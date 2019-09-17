const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const emailSentTests = require('./emailSentTests')

emailSentTests(lab, {
  pageHeading: 'You have saved your application',
  routePath: '/save-return/email-sent-task-check',
  nextRoutePath: '/task-list',
  resentPath: '/save-return/email-sent-resent'
})
