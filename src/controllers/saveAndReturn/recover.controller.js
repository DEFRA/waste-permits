'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

module.exports = class RecoverController extends BaseController {
  async doGet (request, h) {
    const recoveredApplication = await RecoveryService.createApplicationContext(h, {application: true, applicationReturn: true})
    if (!recoveredApplication) {
      return this.redirect({request, h, redirectPath: Constants.Routes.ERROR.RECOVERY_FAILED.path})
    }
    const {application, applicationReturn, standardRule} = recoveredApplication
    const applicationNumber = application.applicationNumber
    const {id: standardRuleId, standardRuleTypeId, code, permitName} = standardRule || {}
    const slug = applicationReturn.slug
    this.path = `${Constants.SAVE_AND_RETURN_URL}/${slug}`
    const pageContext = this.createPageContext()
    Object.assign(pageContext, {slug, applicationNumber, standardRuleId, standardRuleTypeId, code, permitName})
    return this.showView({request, h, pageContext})
  }

  async doPost (request, h) {
    const {cookie} = await RecoveryService.createApplicationContext(h)

    // Now redirect to the tasklist
    return this.redirect({request, h, redirectPath: Constants.Routes.TASK_LIST.path, cookie})
  }
}
