'use strict'

const moment = require('moment')
const config = require('../config/config')
const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')

const DynamicsSolution = require('../models/dynamicsSolution.model')

module.exports = class VersionController extends BaseController {
  async doGet (request, reply) {
    const pageContext = this.createPageContext()

    let authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)

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
  }
}
