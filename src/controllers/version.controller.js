'use strict'

const moment = require('moment')
const Constants = require('../constants')
const BaseController = require('./base.controller')

const DynamicsSolution = require('../models/dynamicsSolution.model')

module.exports = class VersionController extends BaseController {
  static async doGet (request, reply, errors = undefined) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.VERSION.pageHeading)

      let authToken

      // If a cookie already exists, use that token
      if (request.state[Constants.COOKIE_KEY]) {
        authToken = request.state[Constants.COOKIE_KEY].authToken
      // Otherwise, create a new one
      } else {
        let newCookie = await BaseController.generateCookie(reply)
        authToken = newCookie.authToken
      }

      pageContext.dynamicsSolution = await DynamicsSolution.get(authToken)

      pageContext.applicationVersion = Constants.getVersion()
      pageContext.githubRef = Constants.getLatestCommit()
      pageContext.githubUrl = `${Constants.GITHUB_LOCATION}/commit/${Constants.getLatestCommit()}`
      pageContext.renderTimestamp = moment().format(Constants.TIMESTAMP_FORMAT)

      return reply
        .view('version', pageContext)
    } catch (error) {
      console.error(error)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, VersionController, false)
  }
}
