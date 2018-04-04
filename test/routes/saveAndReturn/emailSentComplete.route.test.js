const Lab = require('lab')
const lab = exports.lab = Lab.script()
const emailSentTests = require('./emailSentTests')

emailSentTests(lab, {
  pageHeading: 'You’ve set up save and return for your application',
  routePath: '/save-return/email-sent-task-check',
  nextRoutePath: '/task-list',
  errorPath: '/errors/technical-problem'
})
