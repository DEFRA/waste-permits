'use strict'

const { PAYMENT_CONFIGURATION_PREFIX } = require('../constants')
const { PaymentTypes } = require('../dynamics')
const Utilities = require('../utilities/utilities')
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')
const { BACS_PAYMENT, CARD_PAYMENT } = PaymentTypes

class Payment extends BaseModel {
  static get entity () {
    return 'defra_payments'
  }

  static get mapping () {
    return [
      { field: 'id', dynamics: 'defra_paymentid' },
      { field: 'applicationId', dynamics: '_defra_applicationid_value', bind: { id: 'defra_applicationid', entity: 'defra_applications' } },
      { field: 'applicationLineId', dynamics: '_defra_applicationlineid_value', bind: { id: 'defra_applicationlineid', entity: 'defra_applicationlines' } },
      { field: 'category', dynamics: 'defra_paymentcategory' },
      { field: 'description', dynamics: 'defra_description' },
      { field: 'referenceNumber', dynamics: 'defra_reference_number', readOnly: true },
      { field: 'statusCode', dynamics: 'statuscode' },
      { field: 'type', dynamics: 'defra_type' },
      { field: 'title', dynamics: 'defra_title' },
      { field: 'value', dynamics: 'defra_paymentvalue' }
    ]
  }

  static async getBacsPayment (context, applicationLineId) {
    return this.getByApplicationLineIdAndType(context, applicationLineId, BACS_PAYMENT)
  }

  static async getCardPayment (context, applicationLineId) {
    return this.getByApplicationLineIdAndType(context, applicationLineId, CARD_PAYMENT)
  }

  static async getByApplicationLineIdAndType (context, applicationLineId, type) {
    if (applicationLineId) {
      return this.getBy(context, { applicationLineId, type })
    }
  }

  static async getBacsPaymentDetails (context, applicationLineId) {
    return (await Payment.getByApplicationLineIdAndType(context, applicationLineId, BACS_PAYMENT)) || new Payment({ applicationLineId, type: BACS_PAYMENT })
  }

  static async getCardPaymentDetails (context, applicationLineId) {
    return (await Payment.getByApplicationLineIdAndType(context, applicationLineId, CARD_PAYMENT)) || new Payment({ applicationLineId, type: CARD_PAYMENT })
  }

  async makeCardPayment (context, description, returnUrl) {
    const dynamicsDal = new DynamicsDalService(context.authToken)
    const actionDataObject = {
      ConfigurationPrefix: PAYMENT_CONFIGURATION_PREFIX,
      Amount: this.value,
      ReturnUrl: returnUrl,
      Description: description,
      PaymentRecord: {
        '@odata.type': 'Microsoft.Dynamics.CRM.defra_payment',
        'defra_paymentid': this.id
      }
    }
    try {
      // Call the Dynamics 'create payment' action
      let action = `defra_create_payment_transaction`
      return await dynamicsDal.callAction(action, actionDataObject)
    } catch (error) {
      LoggingService.logError(`Unable to call Dynamics card payment action: ${error}`)
      throw error
    }
  }

  async getCardPaymentResult (context) {
    const dynamicsDal = new DynamicsDalService(context.authToken)
    const actionDataObject = {
      ConfigurationPrefix: PAYMENT_CONFIGURATION_PREFIX,
      LookupByPaymentReference: this.referenceNumber
    }
    try {
      // Call the Dynamics 'payment status' action
      let action = `defra_get_payment_status`
      const actionResult = await dynamicsDal.callAction(action, actionDataObject)

      Utilities.convertFromDynamics(actionResult)

      return actionResult.Status
    } catch (error) {
      LoggingService.logError(`Unable to call Dynamics card payment status action: ${error}`)
      throw error
    }
  }
}

Payment.setDefinitions()

module.exports = Payment
