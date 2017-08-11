'use strict'

const PersistenceService = require('../services/persistence.service')
const persistenceService = new PersistenceService()

module.exports = function (request, reply) {
  const context = {
    pageTitle: 'Waste Permits - Task List'
  }

  // Validate the session cookie
  let token = request.server.methods.validateToken(request.state.session)
  if (!token) {
    // Redirect off an error screen
    return reply.redirect('/error')
  }

  const doGet = async (request, reply) => {
    try {
      const contacts = await persistenceService.listContacts(request.state.session.crmToken)
      console.log(contacts)

      context.contacts = contacts

      return reply
        .view('taskList', context)
        .state('session', request.state.session)
    } catch (e) {
      // TODO log the error ?
      console.log(e)
      return reply.redirect('/error')
    }
  }

  const doPost = (request, reply) => {
    return reply
      .view('taskList', context)
      .state('session', request.state.session)
  }

  if (request.method === 'get') {
    doGet(request, reply)
  } else if (request.method === 'post') {
    doPost(request, reply)
  }
}
