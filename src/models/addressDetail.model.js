'use strict'

const BaseModel = require('./base.model')
const { COMPANY_SECRETARY_EMAIL, COMPANY_REGISTERED_ADDRESS, DESIGNATED_MEMBER_EMAIL, PRIMARY_CONTACT_TELEPHONE_NUMBER, BILLING_INVOICING, INDIVIDUAL_PERMIT_HOLDER, PARTNER_CONTACT_DETAILS, PUBLIC_BODY_MAIN_ADDRESS } = require('../dynamics').AddressTypes

class AddressDetail extends BaseModel {
  static get entity () {
    return 'defra_addressdetailses'
  }

  static get mapping () {
    return [
      { field: 'id', dynamics: 'defra_addressdetailsid' },
      { field: 'applicationId', dynamics: '_defra_applicationid_value', bind: { id: 'defra_applicationId', relationship: 'defra_application_defra_addressdetails', entity: 'defra_applications' } },
      { field: 'addressId', dynamics: '_defra_address_value', bind: { id: 'defra_Address', relationship: 'defra_address_defra_addressdetails', entity: 'defra_addresses' } },
      { field: 'addressName', dynamics: 'defra_name' },
      { field: 'dateOfBirth', dynamics: 'defra_dob' },
      { field: 'customerId', dynamics: '_defra_customer_value', bind: { id: 'defra_Customer_contact', relationship: 'defra_contact_defra_addressdetails', entity: 'contacts' } },
      { field: 'email', dynamics: 'emailaddress', length: { max: 100 } },
      { field: 'telephone', dynamics: 'defra_phone', length: { min: 10, max: 30, maxDigits: 17 } }, // Max digits is the maximum length when spaces have been stripped out
      { field: 'jobTitle', dynamics: 'defra_jobtitle', encode: true, length: { max: 50 } },
      { field: 'type', dynamics: 'defra_addresstype' }
    ]
  }

  static async getByApplicationIdAndType (context, applicationId, type) {
    return super.getBy(context, { applicationId, type })
  }

  static async getDetails (context, applicationId, type) {
    return (await AddressDetail.getByApplicationIdAndType(context, applicationId, type.TYPE)) || new AddressDetail({ applicationId, addressName: type.NAME, type: type.TYPE })
  }

  static async getDesignatedMemberDetails (context, applicationId) {
    return this.getDetails(context, applicationId, DESIGNATED_MEMBER_EMAIL)
  }

  static async getCompanySecretaryDetails (context, applicationId) {
    return this.getDetails(context, applicationId, COMPANY_SECRETARY_EMAIL)
  }

  static async getCompanyRegisteredDetails (context, customerId) {
    return AddressDetail.getBy(context, { customerId, type: COMPANY_REGISTERED_ADDRESS.TYPE })
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

  static async getPublicBodyDetails (context, applicationId) {
    return this.getDetails(context, applicationId, PUBLIC_BODY_MAIN_ADDRESS)
  }

  static async getPartnerDetails (context, applicationId, customerId) {
    const { NAME: addressName, TYPE: type } = PARTNER_CONTACT_DETAILS
    return (await super.getBy(context, { applicationId, customerId, type })) || new AddressDetail({ applicationId, customerId, addressName, type })
  }
}

AddressDetail.setDefinitions()

module.exports = AddressDetail
