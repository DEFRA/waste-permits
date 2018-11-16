'use strict'

const moment = require('moment')
const config = require('../config/config')
const Constants = require('../constants')
const BaseController = require('./base.controller')
const ActiveDirectoryAuthService = require('../services/activeDirectoryAuth.service')
const authService = new ActiveDirectoryAuthService()

const DynamicsSolution = require('../persistence/entities/dynamicsSolution.entity')

module.exports = class VersionController extends BaseController {
  async doGet (request, h) {
    const entityContext = { authToken: await authService.getToken() }
    const pageContext = this.createPageContext(request)

    pageContext.dynamicsSolution = await DynamicsSolution.get(entityContext)

    pageContext.applicationVersion = Constants.getVersion()
    pageContext.githubRef = config.gitSha
    pageContext.githubUrl = `${Constants.GITHUB_LOCATION}/commit/${config.gitSha}`
    pageContext.renderTimestamp = moment().format(Constants.TIMESTAMP_FORMAT)

    return this.showView({ request, h, pageContext })
  }
}
