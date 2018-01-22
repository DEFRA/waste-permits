'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')
const Utilities = require('../utilities/utilities')

module.exports = class Address extends BaseModel {
  constructor (address) {
    super()
    this.entity = 'defra_addresses'
    if (address) {
      this.id = address.id
      this.buildingNameOrNumber = address.buildingNameOrNumber
      this.addressLine1 = address.addressLine1
      this.addressLine2 = address.addressLine2
      this.postcode = address.postcode
      this.fullAddress = address.fullAddress
      this.uprn = address.uprn
    }
    Utilities.convertFromDynamics(this)
  }

  static async getById (authToken, id) {
    let address
    if (id !== undefined) {
      const dynamicsDal = new DynamicsDalService(authToken)
      const query = `defra_addresses(${id})`
      try {
        const result = await dynamicsDal.search(query)
        if (result) {
          address = new Address({
            id: result.defra_addressid,
            postcode: result.defra_postcode
          })
        }
      } catch (error) {
        LoggingService.logError(`Unable to get Address ID: ${error}`)
        throw error
      }
    }
    return address
  }

  static async listByPostcode (authToken, postcode) {
    let addresses
    const dynamicsDal = new DynamicsDalService(authToken)
    const actionDataObject = {
      postcode: postcode
    }
    try {
      // Call Dynamics Companies House action
      let action = `defra_postcodelookup`
      const response = await dynamicsDal.callAction(action, actionDataObject)

      addresses = JSON.parse((JSON.parse(JSON.stringify(response))).addresses).results

      // Parse response into Address objects
      addresses = addresses.map((address) => new Address({
        id: undefined,
        buildingNameOrNumber: address.premises,
        addressLine1: address.street_address,
        addressLine2: address.locality,
        postcode: address.postcode,
        fullAddress: address.address,
        uprn: address.uprn
      }))
    } catch (error) {
      LoggingService.logError(`Unable to list addresses by postcode: ${error}`)
      throw error
    }

    return addresses
  }

  async save (authToken) {
    // Map the Address to the corresponding Dynamics schema Address object
    const dataObject = {
      defra_postcode: this.postcode
    }
    await super.save(authToken, dataObject)
  }
}
