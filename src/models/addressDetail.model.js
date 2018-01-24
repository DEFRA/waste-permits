'use strict'

const Constants = require('../constants')
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')

module.exports = class AddressDetail extends BaseModel {
  // constructor (addressDetail) {
  //   super()
  //   this.entity = 'defra_addressdetailses'
  //   if (addressDetail) {
  //     this.id = addressDetail.id
  //     this.addressType = addressDetail.addressType
  //     this.addressId = addressDetail.addressType
  //     this.applicationId = addressDetail.applicationId
  //     // TODO
  //     // this.customerId = addressDetail.customerId
  //   }
  //   Utilities.convertFromDynamics(this)
  // }

  // static selectedDynamicsFields () {
  //   return [
  //     'defra_name',
  //     'defra_addresstype',
  //     'defra_addressdetailsid',
  //     'defra_applicationId'

  //     // TODO
  //     // 'defra_customer'
  //   ]
  // }

  static mapping () {
    return [
      // {field: 'id', dynamics: 'defra_addressdetailsid'},
      // // {field: 'fullAddress', dynamics: 'defra_name', readOnly: true},
      // {field: 'addressType', dynamics: 'defra_addresstype'},
      // {field: 'addressId', dynamics: '_defra_address_value', bind: {id: '_defra_address_value', entity: 'Address'}},
      // {field: 'defraName', dynamics: 'defra_name', constant: 'Billing Invoicing Address'},
      // {field: 'applicationId', dynamics: '_defra_applicationid_value', bind: {id: 'defra_applicationId', entity: 'defra_applications'}}

      {field: 'id', dynamics: 'defra_addressdetailsid'},
      // {field: 'fullAddress', dynamics: 'defra_name', readOnly: true},
      {field: 'addressType', dynamics: 'defra_addresstype'},
      // {field: 'locationId', dynamics: '_defra_locationid_value', bind: {id: 'defra_locationId', entity: 'defra_locations'}},
      // {field: 'addressId', dynamics: '_defra_addressid_value', bind: {id: 'defra_addressid', entity: 'defra_address'}},

      /// //// this mapping is wrong ?????
      {field: 'addressId', dynamics: '_defra_address_value', bind: {id: 'defra_Address', entity: 'defra_addresses'}},

      // {field: 'addressId', dynamics: '_defra_addressid_value', bind: {id: 'defra_addressId', entity: 'defra_addresses'}},
      {field: 'defraName', dynamics: 'defra_name', constant: 'Billing Invoicing Address'},
      {field: 'applicationId', dynamics: '_defra_applicationid_value', bind: {id: 'defra_applicationId', entity: 'defra_applications'}}

      // TODO
      // 'defra_customer'
    ]
  }

  constructor (...args) {
    super(...args)
    this._entity = 'defra_addressdetailses'
  }

  static async getByApplicationId (authToken, applicationId) {
    let addressDetail
    if (applicationId) {
      const dynamicsDal = new DynamicsDalService(authToken)
      const filter = `_defra_applicationid_value eq ${applicationId}`
      const query = encodeURI(`defra_addressdetailses?$select=${AddressDetail.selectedDynamicsFields()}&$filter=${filter}`)
      try {
        const response = await dynamicsDal.search(query)
        const result = response.value[0]
        if (result) {
          // addressDetail = AddressDetail.dynamicsToModel(result)

          addressDetail = new AddressDetail({
            // TODO
            id: result.defra_addressdetailsid,
            addressType: result.defra_addresstype,
            addressId: result._defra_address_value,
            applicationId: result._defra_applicationid_value
          })
        }
      } catch (error) {
        LoggingService.logError(`Unable to get AddressDetail by application ID: ${error}`)
        throw error
      }
    }
    return addressDetail
  }

  setAddress (addressId) {
    this.addressId = addressId
  }

  async save (authToken) {
    // const dataObject = this.modelToDynamics()

    // TODO make this more generic
    // dataObject.addressType = Constants.Dynamics.AddressType.BILLING_INVOICING

    // await super.save(authToken, dataObject)

    // await super.save(authToken, dataObject)

    // Map the Location to the corresponding Dynamics schema LocationDetail object
    const dataObject = {
      defra_name: "Billing Invoicing Address",
      defra_addresstype: Constants.Dynamics.AddressType.BILLING_INVOICING,
      // 'defra_addressdetailsid@odata.bind': `defra_addresses(${this.id})`,

      // TODO decide if we are going to have a lookup to the Customer
      // defra_customer
      'defra_applicationId@odata.bind': `defra_applications(${this.applicationId})`
    }

    if (this.addressId) {
      dataObject['defra_Address@odata.bind'] = `defra_addresses(${this.addressId})`
    }

    await super.save(authToken, dataObject)
  }
}
