'use strict'

// TODO confirm which version of UUID to use
const uuid4 = require('uuid/v4')

const CrmTokenService = require('../services/crmToken.service')
const crmTokenService = new CrmTokenService()

module.exports = function (request, reply) {
  const context = {
    pageTitle: 'Waste Permits'
  }

  const doGet = (request, reply) => {
    // TODO: Confirm when we are going to create the session cookie

    // if (!request.state.session.token) {
    //   // Generate a session token
    //   const token = uuid4()
    //   console.log('Generated session token: ' + token)
    //
    //   request.state.session.token = token
    // }
    // reply
    //   .view('index', context)
    //   .state('session', request.state.session)

    reply.view('index', context)
  }

  const doPost = async (request, reply) => {
    //   // Generate a session token
    const token = uuid4()
    console.log('Generated session token: ' + token)

    // Generate a CRM token
    const crmToken = await crmTokenService.getToken()
    console.log('Generated CRM token:' + crmToken)

    // TODO: Confirm how session handling will work and where the most appropriate point is to create
    // and destroy session cookies

    const cookie = {
      // token: request.state.session.token,
      token: token,
      crmToken: crmToken
    }

    return reply
      .redirect('/site')

      // Delete the existing session cookie
      .unstate('session')

      // Add the new cookie
      .state('session', cookie)
  }

  if (request.method === 'get') {
    doGet(request, reply)
  } else if (request.method === 'post') {
    doPost(request, reply)
  }
}
