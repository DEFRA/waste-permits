'use strict'

const CookieService = require('../services/cookie.service')
const Account = require('../persistence/entities/account.entity')
const Application = require('../persistence/entities/application.entity')
const ApplicationLine = require('../persistence/entities/applicationLine.entity')
const ApplicationReturn = require('../persistence/entities/applicationReturn.entity')
const Contact = require('../persistence/entities/contact.entity')
const Payment = require('../persistence/entities/payment.entity')
const StandardRule = require('../persistence/entities/standardRule.entity')
const DataStore = require('../models/dataStore.model')
const CharityDetail = require('../models/charityDetail.model')
const TaskDeterminants = require('../models/taskDeterminants.model')

const { STANDARD_RULES, BESPOKE } = require('../constants').PermitTypes
const { COOKIE_KEY: { APPLICATION_ID, APPLICATION_LINE_ID, STANDARD_RULE_ID, STANDARD_RULE_TYPE_ID } } = require('../constants')
const { PERMIT_HOLDER_TYPES } = require('../dynamics')

module.exports = class RecoveryService {
  static async recoverOptionalData (context, options) {
    // Get data from the data store
    const { data } = await DataStore.get(context)

    // Get task determinants
    context.taskDeterminants = await TaskDeterminants.get(context)

    context.dataStore = data
    context.permitType = data.permitType
    context.isStandardRule = context.permitType === STANDARD_RULES.id
    context.isBespoke = context.permitType === BESPOKE.id

    // Add the charity details to the context
    context.charityDetail = await CharityDetail.get(context)

    // Query in parallel for optional entities
    const [applicationLine, applicationReturn, account, contact, cardPayment, standardRule] = await Promise.all([
      options.applicationLine ? ApplicationLine.getById(context, context.applicationLineId) : Promise.resolve(undefined),
      options.applicationReturn ? ApplicationReturn.getByApplicationId(context) : Promise.resolve(undefined),
      options.account && !context.charityDetail.isIndividual ? Account.getByApplicationId(context) : Promise.resolve(undefined),
      options.contact && context.charityDetail.isIndividual ? Contact.getByApplicationId(context) : Promise.resolve(undefined),
      options.cardPayment ? Payment.getCardPaymentDetails(context, context.applicationLineId) : Promise.resolve(undefined),
      options.standardRule && context.isStandardRule ? StandardRule.getByApplicationLineId(context, context.applicationLineId) : Promise.resolve(undefined)
    ])

    return { applicationLine, applicationReturn, account, contact, cardPayment, standardRule }
  }

  static getPermitHolderType (application) {
    return Object.values(PERMIT_HOLDER_TYPES)
      .find(({ dynamicsApplicantTypeId, dynamicsOrganisationTypeId }) => application && dynamicsApplicantTypeId === application.applicantType && dynamicsOrganisationTypeId === application.organisationType)
  }

  static async recoverFromCookies (slug, request, options) {
    const context = request.app.data

    context.slug = slug
    context.applicationId = CookieService.get(request, APPLICATION_ID)
    if (context.applicationId) {
      context.application = await Application.getById(context, context.applicationId)
      context.applicationLineId = CookieService.get(request, APPLICATION_LINE_ID)
      context.standardRuleId = CookieService.get(request, STANDARD_RULE_ID)
      context.standardRuleTypeId = CookieService.get(request, STANDARD_RULE_TYPE_ID)
      context.permitHolderType = RecoveryService.getPermitHolderType(context.application)

      Object.assign(context, await RecoveryService.recoverOptionalData(context, options))
    }

    return context
  }

  static setUpCookies ({ cookie, applicationId, applicationLineId, standardRuleId, standardRuleTypeId }) {
    // Setup all the cookies as if the user hadn't left
    cookie[APPLICATION_ID] = applicationId
    cookie[APPLICATION_LINE_ID] = applicationLineId
    if (standardRuleTypeId) {
      cookie[STANDARD_RULE_ID] = standardRuleId
    }
    if (standardRuleTypeId) {
      cookie[STANDARD_RULE_TYPE_ID] = standardRuleTypeId
    }
  }

  static async recoverFromSlug (slug, h, options) {
    const context = h.request.app.data
    context.cookie = await CookieService.generateCookie(h)
    context.applicationReturn = await ApplicationReturn.getBySlug(context, slug)
    if (context.applicationReturn) {
      context.applicationId = context.applicationReturn.applicationId
      context.application = await Application.getById(context, context.applicationId)
      context.applicationLine = await ApplicationLine.getByApplicationId(context)
      context.applicationLineId = context.applicationLine.id
      context.permitHolderType = RecoveryService.getPermitHolderType(context.application)

      // Don't attempt to get the applicationLine and applicationReturn again
      options.applicationLine = false
      options.applicationReturn = false

      // Always load the standard rule when restoring
      options.standardRule = true

      const { id: standardRuleId, standardRuleTypeId } = context.standardRule || {}

      Object.assign(context, { slug, standardRuleId, standardRuleTypeId }, await RecoveryService.recoverOptionalData(context, options))

      RecoveryService.setUpCookies(context)
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
