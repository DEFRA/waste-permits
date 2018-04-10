'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const CookieService = require('../../services/cookie.service')
const Application = require('../../models/application.model')
const ApplicationLine = require('../../models/applicationLine.model')
const ApplicationReturn = require('../../models/applicationReturn.model')
const StandardRule = require('../../models/standardRule.model')
const {APPLICATION_ID, APPLICATION_LINE_ID, STANDARD_RULE_ID, STANDARD_RULE_TYPE_ID, PERMIT_HOLDER_TYPE} = Constants.COOKIE_KEY

module.exports = class RecoverController extends BaseController {
  static async recoverApplication (slug, h) {
    let recoveredApplication
    const cookie = await CookieService.generateCookie(h)
    let authToken = cookie.authToken
    const applicationReturn = await ApplicationReturn.getBySlug(authToken, slug)
    if (applicationReturn) {
      const {applicationId} = applicationReturn
      const {applicationNumber} = await Application.getById(authToken, applicationId)
      const {id: applicationLineId} = await ApplicationLine.getByApplicationId(authToken, applicationId)
      const {id: standardRuleId, standardRuleTypeId, code, permitName} = await StandardRule.getByApplicationLineId(authToken, applicationLineId)

      recoveredApplication = {slug, cookie, applicationId, applicationLineId, applicationNumber, code, permitName, standardRuleId, standardRuleTypeId}
    }
    return recoveredApplication
  }

  async doGet (request, h) {
    const {slug} = request.params
    const recoveredApplication = await RecoverController.recoverApplication(slug, h)
    if (!recoveredApplication) {
      return this.redirect(request, h, Constants.Routes.ERROR.RECOVERY_FAILED.path)
    }
    const pageContext = this.createPageContext()
    Object.assign(pageContext, recoveredApplication)
    return this.showView(request, h, 'saveAndReturn/recover', pageContext)
  }

  async doPost (request, h) {
    const {slug} = request.payload
    const {cookie, applicationId, applicationLineId, standardRuleId, standardRuleTypeId} = await RecoverController.recoverApplication(slug, h)

    // Setup all the cookies as if the user hadn't left
    cookie[APPLICATION_ID] = applicationId
    cookie[APPLICATION_LINE_ID] = applicationLineId
    cookie[STANDARD_RULE_ID] = standardRuleId
    cookie[STANDARD_RULE_TYPE_ID] = standardRuleTypeId
    cookie[PERMIT_HOLDER_TYPE] = Constants.PERMIT_HOLDER_TYPES.LIMITED_COMPANY.id

    // Now redirect to the tasklist
    return this.redirect(request, h, Constants.Routes.TASK_LIST.path, cookie)
  }
}
