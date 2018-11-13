'use strict'

const BaseEntity = require('./base.entity')

class AddressDetail extends BaseEntity {
  static get dynamicsEntity () {
    return 'defra_addressdetailses'
  }

  static get mapping () {
    return [
      { field: 'id', dynamics: 'defra_addressdetailsid' },
      { field: 'applicationId', dynamics: '_defra_applicationid_value', bind: { id: 'defra_applicationId', relationship: 'defra_application_defra_addressdetails', dynamicsEntity: 'defra_applications' } },
      { field: 'addressId', dynamics: '_defra_address_value', bind: { id: 'defra_Address', relationship: 'defra_address_defra_addressdetails', dynamicsEntity: 'defra_addresses' } },
      { field: 'addressName', dynamics: 'defra_name' },
      { field: 'dateOfBirth', dynamics: 'defra_dob' },
      { field: 'customerId', dynamics: '_defra_customer_value', bind: { id: 'defra_Customer_contact', relationship: 'defra_contact_defra_addressdetails', dynamicsEntity: 'contacts' } },
      { field: 'firstName', dynamics: 'defra_firstname', encode: true, length: { max: 50 } },
      { field: 'lastName', dynamics: 'defra_lastname', encode: true, length: { max: 50 } },
      { field: 'email', dynamics: 'emailaddress', length: { max: 100 } },
      { field: 'telephone', dynamics: 'defra_phone', length: { min: 10, max: 30, maxDigits: 17 } }, // Max digits is the maximum length when spaces have been stripped out
      { field: 'jobTitle', dynamics: 'defra_jobtitle', encode: true, length: { max: 50 } },
      { field: 'type', dynamics: 'defra_addresstype' }
    ]
  }
}

AddressDetail.setDefinitions()

module.exports = AddressDetail
