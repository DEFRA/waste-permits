'use strict'

const Constants = require('../constants')
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
      {field: 'applicationId', dynamics: '_defra_applicationid_value', bind: {id: 'defra_applicationId', entity: 'defra_applications'}},
      {field: 'applicationLineId', dynamics: '_defra_applicationlineid_value', bind: {id: 'defra_applicationlineid', entity: 'defra_applicationlines'}},
      {field: 'category', dynamics: 'defra_paymentcategory'},
      {field: 'statusCode', dynamics: 'statuscode'},
      {field: 'type', dynamics: 'defra_type'},
      {field: 'value', dynamics: 'defra_paymentvalue'}
    ]
  }

  static async getByApplicationLineIdAndType (authToken, applicationLineId, type) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const filter = `_defra_applicationlineid_value eq ${applicationLineId} and defra_type eq ${type}`
    const query = `defra_payments?$select=${Payment.selectedDynamicsFields()}&$filter=${filter}`
    try {
      const response = await dynamicsDal.search(query)
      const result = response && response.value ? response.value.pop() : undefined
      if (result) {
        return Payment.dynamicsToModel(result)
      }
    } catch (error) {
      LoggingService.logError(`Unable to get Payment by Type(${type}): ${error}`)
      throw error
    }
  }

  static async getBacsPaymentDetails (authToken, applicationLineId) {
    return (await Payment.getByApplicationLineIdAndType(authToken, applicationLineId, BACS_PAYMENT)) || new Payment({applicationLineId, type: BACS_PAYMENT})
  }

  static async getCardPaymentDetails (authToken, applicationLineId) {
    return (await Payment.getByApplicationLineIdAndType(authToken, applicationLineId, CARD_PAYMENT)) || new Payment({applicationLineId, type: CARD_PAYMENT})
  }
}

Payment.setDefinitions()

module.exports = Payment
