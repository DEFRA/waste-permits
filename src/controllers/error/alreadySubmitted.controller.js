'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

module.exports = class AlreadySubmittedController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {application} = await RecoveryService.createApplicationContext(h, {application: true})

    pageContext.startOpenOrSavedRoute = Constants.Routes.START_OR_OPEN_SAVED.path
    pageContext.applicationRef = application.applicationNumber

    return this.showView({request, h, viewPath: 'error/alreadySubmitted', pageContext})
  }
}
