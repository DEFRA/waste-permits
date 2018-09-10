'use strict'

const moment = require('moment')
const config = require('../config/config')
const Constants = require('../constants')
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')

const DynamicsSolution = require('../models/dynamicsSolution.model')

module.exports = class VersionController extends BaseController {
  async doGet (request, h) {
    const recoveredApplication = await RecoveryService.createApplicationContext(h, { application: true, applicationReturn: true })
    const pageContext = this.createPageContext(request)

    pageContext.dynamicsSolution = await DynamicsSolution.get(recoveredApplication)

    pageContext.applicationVersion = Constants.getVersion()
    pageContext.githubRef = config.gitSha
    pageContext.githubUrl = `${Constants.GITHUB_LOCATION}/commit/${config.gitSha}`
    pageContext.renderTimestamp = moment().format(Constants.TIMESTAMP_FORMAT)

    return this.showView({ request, h, pageContext })
  }
}
