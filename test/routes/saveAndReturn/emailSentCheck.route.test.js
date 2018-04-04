const Lab = require('lab')
const lab = exports.lab = Lab.script()
const emailSentTests = require('./emailSentTests')

emailSentTests(lab, {
  pageHeading: 'Check your email',
  routePath: '/save-return/email-sent-check',
  nextRoutePath: '/task-list',
  errorPath: '/errors/technical-problem'
})
