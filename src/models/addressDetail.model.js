'use strict'

const Constants = require('../constants')
const BaseModel = require('./base.model')
const {COMPANY_SECRETARY_EMAIL, PRIMARY_CONTACT_TELEPHONE_NUMBER, BILLING_INVOICING, INDIVIDUAL_PERMIT_HOLDER} = Constants.Dynamics.AddressTypes

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
      {field: 'dateOfBirth', dynamics: 'defra_dob'},
      {field: 'email', dynamics: 'emailaddress', length: {max: 100}},
      {field: 'telephone', dynamics: 'defra_phone', length: {min: 10, max: 30, maxDigits: 17}}, // Max digits is the maximum length when spaces have been stripped out
      {field: 'type', dynamics: 'defra_addresstype'}
    ]
  }

  static async getByApplicationIdAndType (context, applicationId, type) {
    return super.getBy(context, {applicationId, type})
  }

  async save (context) {
    const dataObject = this.modelToDynamics()
    await super.save(context, dataObject)
  }

  static async getDetails (context, applicationId, type) {
    return (await AddressDetail.getByApplicationIdAndType(context, applicationId, type.TYPE)) || new AddressDetail({applicationId, addressDetail: type.NAME, type: type.TYPE})
  }

  static async getCompanySecretaryDetails (context, applicationId) {
    return this.getDetails(context, applicationId, COMPANY_SECRETARY_EMAIL)
  }

  static async getPrimaryContactDetails (context, applicationId) {
    return this.getDetails(context, applicationId, PRIMARY_CONTACT_TELEPHONE_NUMBER)
  }

  static async getBillingInvoicingDetails (context, applicationId) {
    return this.getDetails(context, applicationId, BILLING_INVOICING)
  }

  static async getIndividualPermitHolderDetails (context, applicationId) {
    return this.getDetails(context, applicationId, INDIVIDUAL_PERMIT_HOLDER)
  }
}

AddressDetail.setDefinitions()

module.exports = AddressDetail
