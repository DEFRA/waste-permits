'use strict'

const Constants = require('../constants')
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')
const Utilities = require('../utilities/utilities')

module.exports = class ContactDetail extends BaseModel {
  constructor (contactDetail) {
    super()
    this.entity = 'defra_contactdetailses'
    if (contactDetail) {
      this.id = contactDetail.id
      this.addressType = contactDetail.addressType
      this.addressId = contactDetail.addressType
      this.applicationId = contactDetail.applicationId
      // TODO
      // this.customerId = contactDetail.customerId
    }
    Utilities.convertFromDynamics(this)
  }

  static selectedDynamicsFields () {
    return [
      'defra_name',
      'defra_addresstype',
      'defra_addressdetailsid',
      'defra_applicationid'

      // TODO
      // 'defra_customer'
    ]
  }

  static async getByApplicationId (authToken, applicationId, applicationLineId) {
    let contactDetail
    if (applicationId !== undefined) {
      const dynamicsDal = new DynamicsDalService(authToken)
      const filter = `_defra_applicationid_value eq ${applicationId}`
      const query = encodeURI(`defra_contactdetailses?$select=${ContactDetail.selectedDynamicsFields()}&$filter=${filter}`)
      try {
        const response = await dynamicsDal.search(query)
        const result = response.value.pop()
        if (result) {
          contactDetail = new ContactDetail({
            // TODO
            id: result.ContractDetailId,
            addressType: result.defra_addresstype,
            addressId: result.defra_addressdetailsid,
            applicationId: result.defra_applicationid
          })
        }
      } catch (error) {
        LoggingService.logError(`Unable to get ContactDetail by application ID: ${error}`)
        throw error
      }
    }
    return contactDetail
  }

  // setAddress (addressId) {
  //   this.addressId = addressId
  // }

  async save (authToken) {
    // Map the Location to the corresponding Dynamics schema LocationDetail object
    const dataObject = {
      // TODO
      // defra_name = "Billing Invoicing Address"
      defra_addresstype: Constants.Dynamics.AddressType.BILLING_INVOICING,
      'defra_addressdetailsid@odata.bind': `defra_contactdetails(${this.addressId})`,
      // defra_applicationid
      // defra_customer

      // defra_gridreferenceid: this.gridReference,
      'defra_applicationId@odata.bind': `defra_applications(${this.applicationId})`

    }
    // if (this.addressId) {
    //   dataObject['defra_addressId@odata.bind'] = `defra_addresses(${this.addressId})`
    // }
    await super.save(authToken, dataObject)
  }
}
