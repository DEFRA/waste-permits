'use strict'

const Constants = require('../constants')
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')
const {COMPANY_SECRETARY_EMAIL, PRIMARY_CONTACT_TELEPHONE_NUMBER, BILLING_INVOICING} = Constants.Dynamics.AddressTypes

class AddressDetail extends BaseModel {
  static get entity () {
    return 'defra_addressdetailses'
  }

  static get mapping () {
    return [
      {field: 'id', dynamics: 'defra_addressdetailsid'},
      {field: 'applicationId', dynamics: '_defra_applicationid_value', bind: {id: 'defra_applicationId', relationship: 'defra_application_defra_addressdetails', entity: 'defra_applications'}},
      {field: 'addressId', dynamics: '_defra_address_value', bind: {id: 'defra_Address', relationship: 'defra_address_defra_addressdetails', entity: 'defra_addresses'}},
      {field: 'addressName', dynamics: 'defra_name'},
      {field: 'email', dynamics: 'emailaddress', length: {max: 100}},
      {field: 'telephone', dynamics: 'defra_phone', length: {min: 10, max: 30, maxDigits: 17}}, // Max digits is the maximum length when spaces have been stripped out
      {field: 'type', dynamics: 'defra_addresstype'}
    ]
  }

  static async getByApplicationIdAndType (authToken, applicationId, type) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const filter = `_defra_applicationid_value eq ${applicationId} and defra_addresstype eq ${type}`
    const query = `defra_addressdetailses?$select=${AddressDetail.selectedDynamicsFields()}&$filter=${filter}`
    try {
      const response = await dynamicsDal.search(query)
      const result = response && response.value ? response.value.pop() : undefined
      if (result) {
        return AddressDetail.dynamicsToModel(result)
      }
    } catch (error) {
      LoggingService.logError(`Unable to get AddressDetail by Type(${type}): ${error}`)
      throw error
    }
  }

  async save (authToken) {
    const dataObject = this.modelToDynamics()
    await super.save(authToken, dataObject)
  }

  static async getCompanySecretaryDetails (authToken, applicationId) {
    const {TYPE: type, NAME: addressName} = COMPANY_SECRETARY_EMAIL
    return (await AddressDetail.getByApplicationIdAndType(authToken, applicationId, type)) || new AddressDetail({applicationId, addressName, type})
  }

  static async getPrimaryContactDetails (authToken, applicationId) {
    const {TYPE: type, NAME: addressName} = PRIMARY_CONTACT_TELEPHONE_NUMBER
    return (await AddressDetail.getByApplicationIdAndType(authToken, applicationId, type)) || new AddressDetail({applicationId, addressName, type})
  }

  static async getBillingInvoicingDetails (authToken, applicationId) {
    const {TYPE: type, NAME: addressName} = BILLING_INVOICING
    return (await AddressDetail.getByApplicationIdAndType(authToken, applicationId, type)) || new AddressDetail({applicationId, addressName, type})
  }
}

AddressDetail.setDefinitions()

module.exports = AddressDetail
