'use strict'

const { RECOVERY_FAILED, TASK_LIST } = require('../../routes')
const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

module.exports = class RecoverController extends BaseController {
  async doGet (request, h) {
    const recoveredApplication = await RecoveryService.createApplicationContext(h, { application: true, applicationReturn: true })
    if (!recoveredApplication) {
      return this.redirect({ request, h, redirectPath: RECOVERY_FAILED.path })
    }
    const { application, applicationReturn, standardRule } = recoveredApplication
    const applicationNumber = application.applicationNumber
    const { id: standardRuleId, standardRuleTypeId, code, permitName } = standardRule || {}
    const slug = applicationReturn.slug
    const pageContext = this.createPageContext(request)
    pageContext.formAction = request.path
    Object.assign(pageContext, { slug, applicationNumber, standardRuleId, standardRuleTypeId, code, permitName })
    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { cookie } = context

    // Now redirect to the tasklist
    return this.redirect({ request, h, redirectPath: TASK_LIST.path, cookie })
  }
}
