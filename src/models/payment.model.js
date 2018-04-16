'use strict'

const Constants = require('../constants')
const Utilities = require('../utilities/utilities')
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')
const {BACS_PAYMENT, CARD_PAYMENT} = Constants.Dynamics.PaymentTypes

class Payment extends BaseModel {
  static get entity () {
    return 'defra_payments'
  }

  static get mapping () {
    return [
      {field: 'id', dynamics: 'defra_paymentid'},
      {field: 'applicationId', dynamics: '_defra_applicationid_value', bind: {id: 'defra_applicationId', entity: 'defra_applications'}},
      {field: 'applicationLineId', dynamics: '_defra_applicationlineid_value', bind: {id: 'defra_applicationlineid', entity: 'defra_applicationlines'}},
      {field: 'category', dynamics: 'defra_paymentcategory'},
      {field: 'description', dynamics: 'defra_description'},
      {field: 'referenceNumber', dynamics: 'defra_reference_number', readOnly: true},
      {field: 'statusCode', dynamics: 'statuscode'},
      {field: 'type', dynamics: 'defra_type'},
      {field: 'value', dynamics: 'defra_paymentvalue'}
    ]
  }

  isPaid () {
    return Boolean(this.statusCode === Constants.Dynamics.PaymentStatusCodes.ISSUED)
  }

  static async getByApplicationLineIdAndType (authToken, applicationLineId, type) {
    let payment
    if (applicationLineId) {
      const dynamicsDal = new DynamicsDalService(authToken)
      const filter = `_defra_applicationlineid_value eq ${applicationLineId} and defra_type eq ${type}`
      const query = `defra_payments?$select=${Payment.selectedDynamicsFields()}&$filter=${filter}`
      try {
        const response = await dynamicsDal.search(query)
        const result = response && response.value ? response.value.pop() : undefined
        if (result) {
          payment = Payment.dynamicsToModel(result)
        }
      } catch (error) {
        LoggingService.logError(`Unable to get Payment by Application Line ID and Type(${type}): ${error}`)
        throw error
      }
    }
    return payment
  }

  static async getBacsPaymentDetails (authToken, applicationLineId) {
    return (await Payment.getByApplicationLineIdAndType(authToken, applicationLineId, BACS_PAYMENT)) || new Payment({applicationLineId, type: BACS_PAYMENT})
  }

  static async getCardPaymentDetails (authToken, applicationLineId) {
    return (await Payment.getByApplicationLineIdAndType(authToken, applicationLineId, CARD_PAYMENT)) || new Payment({applicationLineId, type: CARD_PAYMENT})
  }

  async makeCardPayment (authToken, description, returnUrl) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const actionDataObject = {
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
      const actionResult = await dynamicsDal.callAction(action, actionDataObject)
      return actionResult ? actionResult.PaymentNextUrlHref : undefined
    } catch (error) {
      LoggingService.logError(`Unable to call Dynamics card payment action: ${error}`)
      throw error
    }
  }

  async getCardPaymentResult (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const actionDataObject = {
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
