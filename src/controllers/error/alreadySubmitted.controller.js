'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')

module.exports = class AlreadySubmittedController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const {application} = await this.createApplicationContext(request, {application: true})

    pageContext.startOpenOrSavedRoute = Constants.Routes.START_OR_OPEN_SAVED.path
    pageContext.applicationRef = application.applicationNumber

    return this.showView(request, reply, 'error/alreadySubmitted', pageContext)
  }
}
