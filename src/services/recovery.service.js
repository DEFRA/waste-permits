'use strict'

const CookieService = require('../services/cookie.service')
const Application = require('../models/application.model')
const ApplicationLine = require('../models/applicationLine.model')
const ApplicationReturn = require('../models/applicationReturn.model')
const Contact = require('../models/contact.model')
const StandardRule = require('../models/standardRule.model')

module.exports = class RecoveryService {
  static async recoverApplication (slug, h) {
    let recoveredApplication
    const cookie = await CookieService.generateCookie(h)
    let authToken = cookie.authToken
    const applicationReturn = await ApplicationReturn.getBySlug(authToken, slug)
    if (applicationReturn) {
      const {applicationId} = applicationReturn
      const application = await Application.getById(authToken, applicationId)
      const {applicationNumber} = application
      const {id: applicationLineId} = await ApplicationLine.getByApplicationId(authToken, applicationId)
      const {id: standardRuleId, standardRuleTypeId, code, permitName} = await StandardRule.getByApplicationLineId(authToken, applicationLineId)
      const contact = await Contact.getByApplicationId(authToken, applicationId)

      recoveredApplication = {slug, cookie, authToken, application, contact, applicationId, applicationLineId, applicationNumber, code, permitName, standardRuleId, standardRuleTypeId}
    }
    return recoveredApplication
  }
}
