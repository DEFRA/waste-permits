'use strict'

const Constants = require('../constants')
const CookieService = require('../services/cookie.service')
const Account = require('../models/account.model')
const Application = require('../models/application.model')
const ApplicationLine = require('../models/applicationLine.model')
const ApplicationReturn = require('../models/applicationReturn.model')
const Contact = require('../models/contact.model')
const Payment = require('../models/payment.model')
const StandardRule = require('../models/standardRule.model')
const {AUTH_TOKEN, APPLICATION_ID, APPLICATION_LINE_ID, STANDARD_RULE_ID, STANDARD_RULE_TYPE_ID, PERMIT_HOLDER_TYPE} = Constants.COOKIE_KEY

module.exports = class RecoveryService {
  static async recoverOptionalData (authToken, applicationId, applicationLineId, options) {
    // Query in parallel for optional entities
    const [application, applicationLine, applicationReturn, account, contact, individualPermitHolder, payment, cardPayment, standardRule] = await Promise.all([
      options.application ? Application.getById(authToken, applicationId) : Promise.resolve(undefined),
      options.applicationLine ? ApplicationLine.getById(authToken, applicationLineId) : Promise.resolve(undefined),
      options.applicationReturn ? ApplicationReturn.getByApplicationId(authToken, applicationId) : Promise.resolve(undefined),
      options.account ? Account.getByApplicationId(authToken, applicationId) : Promise.resolve(undefined),
      options.contact ? Contact.getByApplicationId(authToken, applicationId) : Promise.resolve(undefined),
      options.individualPermitHolder ? Contact.getIndividualPermitHolderByApplicationId(authToken, applicationId) : Promise.resolve(undefined),
      options.payment ? Payment.getBacsPaymentDetails(authToken, applicationLineId) : Promise.resolve(undefined),
      options.cardPayment ? Payment.getCardPaymentDetails(authToken, applicationLineId) : Promise.resolve(undefined),
      options.standardRule ? StandardRule.getByApplicationLineId(authToken, applicationLineId) : Promise.resolve(undefined)
    ])

    return {application, applicationLine, applicationReturn, account, contact, individualPermitHolder, payment, cardPayment, standardRule}
  }

  static async recoverFromCookies (slug, request, options) {
    const authToken = CookieService.get(request, AUTH_TOKEN)
    const applicationId = CookieService.get(request, APPLICATION_ID)
    const applicationLineId = CookieService.get(request, APPLICATION_LINE_ID)
    const standardRuleId = CookieService.get(request, STANDARD_RULE_ID)
    const standardRuleTypeId = CookieService.get(request, STANDARD_RULE_TYPE_ID)
    const permitHolderType = CookieService.get(request, PERMIT_HOLDER_TYPE)

    // Query in parallel for optional entities
    const {application, applicationLine, applicationReturn, account, contact, individualPermitHolder, payment, cardPayment, standardRule} = await RecoveryService.recoverOptionalData(authToken, applicationId, applicationLineId, options)

    return {slug, authToken, applicationId, applicationLineId, application, applicationLine, applicationReturn, account, contact, individualPermitHolder, payment, cardPayment, standardRule, standardRuleId, standardRuleTypeId, permitHolderType}
  }

  static async recoverFromSlug (slug, h, options) {
    let recoveredApplication
    const cookie = await CookieService.generateCookie(h)
    let authToken = cookie.authToken
    const applicationReturn = await ApplicationReturn.getBySlug(authToken, slug)
    if (applicationReturn) {
      const applicationId = applicationReturn.applicationId

      const application = await Application.getById(authToken, applicationId)

      const applicationLine = await ApplicationLine.getByApplicationId(authToken, applicationId)
      const applicationLineId = applicationLine.id

      // Don't attempt to get the application, applicationLine and applicationReturn again
      options.application = false
      options.applicationLine = false
      options.applicationReturn = false

      // Always load the standard rule when restoring
      options.standardRule = true

      const {account, contact, individualPermitHolder, payment, cardPayment, standardRule} = await RecoveryService.recoverOptionalData(authToken, applicationId, applicationLineId, options)
      const {id: standardRuleId, standardRuleTypeId} = standardRule || {}

      const permitHolderType = Constants.PERMIT_HOLDER_TYPES.LIMITED_COMPANY.id

      recoveredApplication = {slug, cookie, authToken, applicationId, applicationLineId, application, applicationLine, applicationReturn, account, contact, individualPermitHolder, payment, cardPayment, standardRule, standardRuleId, standardRuleTypeId, permitHolderType}

      // Setup all the cookies as if the user hadn't left
      cookie[AUTH_TOKEN] = authToken
      cookie[APPLICATION_ID] = applicationId
      cookie[APPLICATION_LINE_ID] = applicationLineId
      if (standardRuleTypeId) {
        cookie[STANDARD_RULE_ID] = standardRuleId
      }
      if (standardRuleTypeId) {
        cookie[STANDARD_RULE_TYPE_ID] = standardRuleTypeId
      }
      cookie[PERMIT_HOLDER_TYPE] = permitHolderType
    }

    return recoveredApplication
  }

  static async createApplicationContext (h, options = {}) {
    let {request} = h
    let {slug = ''} = request.params
    let data = {}

    if (slug) {
      data = await RecoveryService.recoverFromSlug(slug, h, options)
    } else {
      data = await RecoveryService.recoverFromCookies(slug, request, options)
    }

    request.app.data = request.app.data || {}

    Object.assign(request.app.data, data)

    return request.app.data
  }
}
