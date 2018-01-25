'use strict'

const Constants = require('../constants')
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')

module.exports = class AddressDetail extends BaseModel {
  static mapping () {
    return [
      {field: 'id', dynamics: 'defra_addressdetailsid'},
      // TODO remove this?
      // {field: 'applicationId', dynamics: '_defra_applicationid_value', bind: {id: 'defra_applicationId', entity: 'defra_applications'}},
      {field: 'applicationId', dynamics: '_defra_applicationid_value', bind: {id: 'defra_applicationId', relationship: 'defra_application_defra_addressdetails', entity: 'defra_applications'}},
      // TODO remove this?
      // {field: 'addressId', dynamics: '_defra_address_value', bind: {id: 'defra_Address', entity: 'defra_addresses'}},
      {field: 'addressId', dynamics: '_defra_address_value', bind: {id: 'defra_Address', relationship: 'defra_address_defra_addressdetails', entity: 'defra_addresses'}},
      {field: 'defraName', dynamics: 'defra_name', constant: 'Billing Invoicing Address'},
      {field: 'email', dynamics: 'emailaddress'},
      {field: 'name', dynamics: 'defra_name'},
      {field: 'telephone', dynamics: 'defra_phone'},
      {field: 'type', dynamics: 'defra_addresstype'}
    ]
  }

  constructor (...args) {
    super(...args)
    this._entity = 'defra_addressdetailses'
  }

  // TODO remove this
  // static async getByApplicationId (authToken, applicationId) {
  //   let addressDetail
  //   if (applicationId) {
  //     const dynamicsDal = new DynamicsDalService(authToken)
  //     const filter = `_defra_applicationid_value eq ${applicationId}`
  //     const query = encodeURI(`defra_addressdetailses?$select=${AddressDetail.selectedDynamicsFields()}&$filter=${filter}`)
  //     try {
  //       const response = await dynamicsDal.search(query)
  //       const result = response.value[0]
        // if (result) {
        //   addressDetail = AddressDetail.dynamicsToModel(result)

  //         addressDetail = new AddressDetail({
  //           // TODO
  //           id: result.defra_addressdetailsid,
  //           type: result.defra_addresstype,
  //           addressId: result._defra_address_value,
  //           applicationId: result._defra_applicationid_value
  //         })
  //       }
  //     } catch (error) {
  //       LoggingService.logError(`Unable to get AddressDetail by application ID: ${error}`)
  //       throw error
  //     }
  //   }
  //   return addressDetail
  // }

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

  setAddress (addressId) {
    this.addressId = addressId
  }

  async save (authToken) {
    // const dataObject = this.modelToDynamics()

    // TODO make this more generic
    // dataObject.type = Constants.Dynamics.AddressTypes.BILLING_INVOICING.TYPE

    // await super.save(authToken, dataObject)

    // Map the Location to the corresponding Dynamics schema LocationDetail object
    const dataObject = {
      defra_name: 'Billing Invoicing Address',
      defra_addresstype: Constants.Dynamics.AddressTypes.BILLING_INVOICING.TYPE,
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
