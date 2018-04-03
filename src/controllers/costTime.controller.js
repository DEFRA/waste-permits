'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CostTime = require('../models/taskList/costTime.model')

module.exports = class CostTimeController extends BaseController {
  async doGet (request, h) {
    const pageContext = this.createPageContext()
    const {application, applicationLine = {}, payment} = await this.createApplicationContext(request, {application: true, applicationLine: true, payment: true})

    const redirectPath = await this.checkRouteAccess(application, payment)
    if (redirectPath) {
      return this.redirect(request, h, redirectPath)
    }

    // Default to 0 when the balance hasn't been set
    const {value = 0} = applicationLine

    pageContext.cost = value.toLocaleString()

    return this.showView(request, h, 'costTime', pageContext)
  }

  async doPost (request, h) {
    const {authToken, applicationId, applicationLineId} = await this.createApplicationContext(request)

    await CostTime.updateCompleteness(authToken, applicationId, applicationLineId)

    return this.redirect(request, h, Constants.Routes.TASK_LIST.path)
  }
}
