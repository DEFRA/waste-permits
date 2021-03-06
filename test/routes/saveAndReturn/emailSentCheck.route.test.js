const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const emailSentTests = require('./emailSentTests')

emailSentTests(lab, {
  pageHeading: 'Check your email',
  routePath: '/save-return/email-sent-check',
  nextRoutePath: '/task-list',
  resentPath: '/save-return/email-sent-resent',
  firstTime: true
})
