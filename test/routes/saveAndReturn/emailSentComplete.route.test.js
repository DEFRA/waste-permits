const Lab = require('lab')
const lab = exports.lab = Lab.script()
const emailSentTests = require('./emailSentTests')

emailSentTests(lab, {
  pageHeading: 'You have saved your application',
  routePath: '/save-return/email-sent-task-check',
  nextRoutePath: '/task-list',
  errorPath: '/errors/technical-problem'
})
