'use strict'

const { RECOVERY_FAILED, TASK_LIST } = require('../../routes')
const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

module.exports = class RecoverController extends BaseController {
  async doGet (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    if (!context) {
      return this.redirect({ h, route: RECOVERY_FAILED })
    }
    const { application, standardRule, slug } = context
    const applicationNumber = application.applicationNumber
    const { id: standardRuleId, standardRuleTypeId, code, permitName } = standardRule || {}
    const pageContext = this.createPageContext(h)
    pageContext.formAction = request.path
    Object.assign(pageContext, { slug, applicationNumber, standardRuleId, standardRuleTypeId, code, permitName })
    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { cookie } = context

    // Now redirect to the tasklist
    return this.redirect({ h, route: TASK_LIST, cookie })
  }
}
