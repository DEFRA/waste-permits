'use strict'

const Routes = require('../../routes')
const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

module.exports = class AlreadySubmittedController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const { application } = await RecoveryService.createApplicationContext(h, { application: true })

    pageContext.startOpenOrSavedRoute = Routes.START_OR_OPEN_SAVED.path
    pageContext.applicationRef = application.applicationNumber

    return this.showView({ h, pageContext })
  }
}
