// TODO confirm which version of UUID to use
const uuid4 = require('uuid/v4')

module.exports = function (request, reply) {
  const context = {
    pageTitle: 'Waste Permits'
  }

  // Generate a token
  const token = uuid4()
  console.log('Generated token: ' + token)

  reply
    .view('index', context)
    .unstate('session')                   // Delete existing session cookie
    .state('session', { token: token })   // Create new session cookie
}
