'use strict'

const { PAYMENT_CONFIGURATION_PREFIX, MCP_CATEGORY_NAMES } = require('../../constants')
const { MCP_PREFIX, WASTE_PREFIX } = PAYMENT_CONFIGURATION_PREFIX
const { PaymentTypes, MCP } = require('../../dynamics')
const Utilities = require('../../utilities/utilities')
const DynamicsDalService = require('../../services/dynamicsDal.service')
const BaseEntity = require('./base.entity')
const LoggingService = require('../../services/logging.service')
const { BACS_PAYMENT, CARD_PAYMENT } = PaymentTypes

class Payment extends BaseEntity {
  static get dynamicsEntity () {
    return 'defra_payments'
  }

  static get mapping () {
    return [
      { field: 'id', dynamics: 'defra_paymentid' },
      { field: 'applicationId', dynamics: '_defra_applicationid_value', bind: { id: 'defra_applicationid', dynamicsEntity: 'defra_applications' } },
      { field: 'applicationLineId', dynamics: '_defra_applicationlineid_value', bind: { id: 'defra_applicationlineid', dynamicsEntity: 'defra_applicationlines' } },
      { field: 'category', dynamics: 'defra_paymentcategory' },
      { field: 'description', dynamics: 'defra_description' },
      { field: 'referenceNumber', dynamics: 'defra_reference_number', readOnly: true },
      { field: 'statusCode', dynamics: 'statuscode' },
      { field: 'type', dynamics: 'defra_type' },
      { field: 'title', dynamics: 'defra_title' },
      { field: 'value', dynamics: 'defra_paymentvalue' },
      { field: 'customerPaymentReference', dynamics: 'defra_customer_payment_reference', encode: true, length: { max: 30 } },
      { field: 'customerPaymentAmount', dynamics: 'defra_customer_payment_amount' },
      { field: 'customerPaymentDate', dynamics: 'defra_customer_payment_date', isDate: true }
    ]
  }

  static getPermitCategory ({ taskDeterminants }) {
    const { facilityType, permitCategory } = taskDeterminants
    if (facilityType) {
      return facilityType === MCP ? MCP_PREFIX : WASTE_PREFIX
    } else {
      const isMcp = MCP_CATEGORY_NAMES.find((mcpCategoryName) => mcpCategoryName === permitCategory.categoryName)
      return isMcp ? MCP_PREFIX : WASTE_PREFIX
    }
  }

  static async getBacsPayment (context) {
    return this.getByApplicationLineIdAndType(context, BACS_PAYMENT)
  }

  static async getCardPayment (context) {
    return this.getByApplicationLineIdAndType(context, CARD_PAYMENT)
  }

  static async getByApplicationLineIdAndType (context, type) {
    const { applicationLineId } = context
    if (applicationLineId) {
      return this.getBy(context, { applicationLineId, type })
    }
  }

  static async getBacsPaymentDetails (context) {
    const { applicationLineId } = context
    return (await Payment.getByApplicationLineIdAndType(context, BACS_PAYMENT)) || new Payment({ applicationLineId, type: BACS_PAYMENT })
  }

  static async getCardPaymentDetails (context) {
    const { applicationLineId } = context
    return (await Payment.getByApplicationLineIdAndType(context, CARD_PAYMENT)) || new Payment({ applicationLineId, type: CARD_PAYMENT })
  }

  async makeCardPayment (context, description, returnUrl) {
    const dynamicsDal = new DynamicsDalService(context.authToken)
    const actionDataObject = {
      ConfigurationPrefix: Payment.getPermitCategory(context),
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
      ConfigurationPrefix: Payment.getPermitCategory(context),
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
