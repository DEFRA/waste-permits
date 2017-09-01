'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')

module.exports = class VersionController extends BaseController {
  static async doGet (request, reply, errors = undefined) {
    try {
      // TODO: This will need to be updated when merged to master - we have a new way of doing this now!
      // (The PR in question has not been approved yet)
      const pageContext = {
        pageHeading: 'Waste Permits',
        pageTitle: 'TODO'
      }

      pageContext.applicationVersion = Constants.getVersion()
      pageContext.githubRef = Constants.getLatestCommit()
      pageContext.githubUrl = `${Constants.GITHUB_LOCATION}/commit/${Constants.getLatestCommit()}`
      pageContext.renderTimestamp = Date.now()

      return reply
        .view('version', pageContext)
    } catch (error) {
      console.error(error)
      return reply.redirect('/error')
    }
  }

  static handler (request, reply) {
    return BaseController.handler(request, reply, VersionController)
  }
}
