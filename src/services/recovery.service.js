'use strict'

const CookieService = require('../services/cookie.service')
const Account = require('../persistence/entities/account.entity')
const Application = require('../persistence/entities/application.entity')
const ApplicationLine = require('../persistence/entities/applicationLine.entity')
const ApplicationReturn = require('../persistence/entities/applicationReturn.entity')
const Contact = require('../persistence/entities/contact.entity')
const Payment = require('../persistence/entities/payment.entity')
const StandardRule = require('../persistence/entities/standardRule.entity')

const { COOKIE_KEY: { AUTH_TOKEN, APPLICATION_ID, APPLICATION_LINE_ID, STANDARD_RULE_ID, STANDARD_RULE_TYPE_ID } } = require('../constants')
const { PERMIT_HOLDER_TYPES } = require('../dynamics')

module.exports = class RecoveryService {
  static async recoverOptionalData (context, applicationId, applicationLineId, options) {
    context.applicationId = applicationId
    context.applicationLineId = applicationLineId
    // Query in parallel for optional entities
    const [application, applicationLine, applicationReturn, account, contact, cardPayment, standardRule] = await Promise.all([
      options.application ? Application.getById(context, applicationId) : Promise.resolve(undefined),
      options.applicationLine ? ApplicationLine.getById(context, applicationLineId) : Promise.resolve(undefined),
      options.applicationReturn ? ApplicationReturn.getByApplicationId(context, applicationId) : Promise.resolve(undefined),
      options.account ? Account.getByApplicationId(context, applicationId) : Promise.resolve(undefined),
      options.contact ? Contact.getByApplicationId(context, applicationId) : Promise.resolve(undefined),
      options.cardPayment ? Payment.getCardPaymentDetails(context, applicationLineId) : Promise.resolve(undefined),
      options.standardRule ? StandardRule.getByApplicationLineId(context, applicationLineId) : Promise.resolve(undefined)
    ])

    return { application, applicationLine, applicationReturn, account, contact, cardPayment, standardRule }
  }

  static getPermitHolderType (application) {
    return Object.entries(PERMIT_HOLDER_TYPES)
      .filter(([key, { dynamicsApplicantTypeId, dynamicsOrganisationTypeId }]) => application && dynamicsApplicantTypeId === application.applicantType && dynamicsOrganisationTypeId === application.organisationType)
      .map(([key, permitHolderType]) => permitHolderType)
      .pop()
  }

  static async recoverFromCookies (slug, request, options) {
    const context = request.app.data

    context.authToken = CookieService.get(request, AUTH_TOKEN)
    const applicationId = CookieService.get(request, APPLICATION_ID)
    const application = await Application.getById(context, applicationId)
    const applicationLineId = CookieService.get(request, APPLICATION_LINE_ID)
    const standardRuleId = CookieService.get(request, STANDARD_RULE_ID)
    const standardRuleTypeId = CookieService.get(request, STANDARD_RULE_TYPE_ID)
    const permitHolderType = RecoveryService.getPermitHolderType(application)

    // Query in parallel for optional entities
    const { applicationLine, applicationReturn, account, contact, cardPayment, standardRule } = await RecoveryService.recoverOptionalData(context, applicationId, applicationLineId, options)

    Object.assign(context, { slug, applicationId, applicationLineId, application, applicationLine, applicationReturn, account, contact, cardPayment, standardRule, standardRuleId, standardRuleTypeId, permitHolderType })

    return context
  }

  static async recoverFromSlug (slug, h, options) {
    const context = h.request.app.data
    const cookie = await CookieService.generateCookie(h)
    context.authToken = cookie.authToken

    const applicationReturn = await ApplicationReturn.getBySlug(context, slug)
    if (applicationReturn) {
      const applicationId = applicationReturn.applicationId

      const application = await Application.getById(context, applicationId)

      const applicationLine = await ApplicationLine.getByApplicationId(context, applicationId)
      const applicationLineId = applicationLine.id

      // Don't attempt to get the application, applicationLine and applicationReturn again
      options.application = false
      options.applicationLine = false
      options.applicationReturn = false

      // Always load the standard rule when restoring
      options.standardRule = true

      const { account, contact, cardPayment, standardRule } = await RecoveryService.recoverOptionalData(context, applicationId, applicationLineId, options)
      const { id: standardRuleId, standardRuleTypeId } = standardRule || {}

      const permitHolderType = RecoveryService.getPermitHolderType(application)

      Object.assign(context, { slug, cookie, applicationId, applicationLineId, application, applicationLine, applicationReturn, account, contact, cardPayment, standardRule, standardRuleId, standardRuleTypeId, permitHolderType })

      // Setup all the cookies as if the user hadn't left
      cookie[AUTH_TOKEN] = context.authToken
      cookie[APPLICATION_ID] = applicationId
      cookie[APPLICATION_LINE_ID] = applicationLineId
      if (standardRuleTypeId) {
        cookie[STANDARD_RULE_ID] = standardRuleId
      }
      if (standardRuleTypeId) {
        cookie[STANDARD_RULE_TYPE_ID] = standardRuleTypeId
      }
    }

    return context
  }

  static async createApplicationContext (h, options = {}) {
    let { request } = h
    let { slug = '' } = request.params

    if (!request.app.data) {
      request.app.data = {}
    }

    if (slug) {
      await RecoveryService.recoverFromSlug(slug, h, options)
    } else {
      await RecoveryService.recoverFromCookies(slug, request, options)
    }

    return request.app.data
  }
}
