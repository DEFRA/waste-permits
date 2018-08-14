'use strict'

const moment = require('moment')
const config = require('../config/config')
const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')

const DynamicsSolution = require('../models/dynamicsSolution.model')

module.exports = class VersionController extends BaseController {
  async doGet (request, h) {
    const pageContext = this.createPageContext(request)

    let context = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)

    // If we didn't get an Auth token from the cookie then create a new one
    if (!context) {
      const cookie = await CookieService.generateCookie(h)
      context = cookie.context
    }

    pageContext.dynamicsSolution = await DynamicsSolution.get(context)

    pageContext.applicationVersion = Constants.getVersion()
    pageContext.githubRef = config.gitSha
    pageContext.githubUrl = `${Constants.GITHUB_LOCATION}/commit/${config.gitSha}`
    pageContext.renderTimestamp = moment().format(Constants.TIMESTAMP_FORMAT)

    return this.showView({request, h, pageContext})
  }
}
