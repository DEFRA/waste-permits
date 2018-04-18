'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')
const {APPLICATION_ID, APPLICATION_LINE_ID, STANDARD_RULE_ID, STANDARD_RULE_TYPE_ID, PERMIT_HOLDER_TYPE} = Constants.COOKIE_KEY

module.exports = class RecoverController extends BaseController {
  async doGet (request, h) {
    const {slug} = request.params
    const recoveredApplication = await RecoveryService.recoverApplication(slug, h)
    if (!recoveredApplication) {
      return this.redirect({request, h, redirectPath: Constants.Routes.ERROR.RECOVERY_FAILED.path})
    }
    const pageContext = this.createPageContext()
    Object.assign(pageContext, recoveredApplication)
    return this.showView({request, h, viewPath: 'saveAndReturn/recover', pageContext})
  }

  async doPost (request, h) {
    const {slug} = request.payload
    const {cookie, applicationId, applicationLineId, standardRuleId, standardRuleTypeId} = await RecoveryService.recoverApplication(slug, h)

    // Setup all the cookies as if the user hadn't left
    cookie[APPLICATION_ID] = applicationId
    cookie[APPLICATION_LINE_ID] = applicationLineId
    cookie[STANDARD_RULE_ID] = standardRuleId
    cookie[STANDARD_RULE_TYPE_ID] = standardRuleTypeId
    cookie[PERMIT_HOLDER_TYPE] = Constants.PERMIT_HOLDER_TYPES.LIMITED_COMPANY.id

    // Now redirect to the tasklist
    return this.redirect({request, h, redirectPath: Constants.Routes.TASK_LIST.path, cookie})
  }
}
