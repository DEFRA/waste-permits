'use strict'

const moment = require('moment')
const config = require('../config/config')
const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')

const DynamicsSolution = require('../models/dynamicsSolution.model')

module.exports = class VersionController extends BaseController {
  static async doGet (request, reply, errors = undefined) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.VERSION)

      let authToken = CookieService.getAuthToken(request)

      // If we didn't get an Auth token from the cookie then create a new one
      if (!authToken) {
        const cookie = await CookieService.generateCookie(reply)
        authToken = cookie.authToken
      }

      pageContext.dynamicsSolution = await DynamicsSolution.get(authToken)

      pageContext.applicationVersion = Constants.getVersion()
      pageContext.githubRef = config.gitSha
      pageContext.githubUrl = `${Constants.GITHUB_LOCATION}/commit/${config.gitSha}`
      pageContext.renderTimestamp = moment().format(Constants.TIMESTAMP_FORMAT)

      return reply
        .view('version', pageContext)
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, VersionController, false)
  }
}
