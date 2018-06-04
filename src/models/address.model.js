'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')

class Address extends BaseModel {
  static get entity () {
    return 'defra_addresses'
  }

  static get mapping () {
    return [
      {field: 'id', dynamics: 'defra_addressid'},
      {field: 'buildingNameOrNumber', dynamics: 'defra_premises', length: {max: 50}},
      {field: 'addressLine1', dynamics: 'defra_street', length: {max: 100}},
      {field: 'addressLine2', dynamics: 'defra_locality', length: {max: 100}},
      {field: 'townOrCity', dynamics: 'defra_towntext', length: {max: 70}},
      {field: 'postcode', dynamics: 'defra_postcode', length: {max: 8}},
      {field: 'uprn', dynamics: 'defra_uprn', length: {max: 20}},
      {field: 'fromAddressLookup', dynamics: 'defra_fromaddresslookup'},
      {field: 'fullAddress', dynamics: 'defra_name', length: {max: 450}}
    ]
  }

  static async getByUprn (context, uprn) {
    if (!context) {
      const errorMessage = `Unable to get ${this._entity} by UPRN: Context not supplied`
      LoggingService.logError(errorMessage)
      throw new Error(errorMessage)
    }

    let address
    const dynamicsDal = new DynamicsDalService(context.authToken)
    const filter = `defra_uprn eq '${uprn}'`
    const query = `defra_addresses?$select=${this.selectedDynamicsFields()}&$filter=${filter}`
    try {
      const response = await dynamicsDal.search(query)
      const result = response && response.value ? response.value.pop() : undefined
      if (result) {
        address = this.dynamicsToModel(result)
      }
    } catch (error) {
      LoggingService.logError(`Unable to get ${this.name} by UPRN(${uprn}): ${error}`)
      throw error
    }
    return address
  }

  static async listByPostcode (context, postcode) {
    let addresses
    const dynamicsDal = new DynamicsDalService(context.authToken)
    const actionDataObject = {
      postcode: postcode
    }
    try {
      // Call Dynamics Companies House action
      let action = `defra_postcodelookup`
      const response = await dynamicsDal.callAction(action, actionDataObject)

      if (response) {
        // Parse AddressBase response objects into Address objects
        addresses = JSON.parse((JSON.parse(JSON.stringify(response))).addresses).results
        addresses = addresses.map((address) => new Address({
          id: undefined,
          buildingNameOrNumber: address.premises,
          addressLine1: address.street_address,
          addressLine2: address.locality,
          townOrCity: address.city,
          postcode: address.postcode,
          fullAddress: address.address,
          uprn: address.uprn.toString(),
          fromAddressLookup: true
        }))
      }
    } catch (error) {
      LoggingService.logError(`Unable to list addresses by postcode: ${error}`)
      throw error
    }

    return addresses
  }

  async save (context) {
    // Build the address name (i.e. the full address) if it is a manual address entry
    if (!this.fromAddressLookup) {
      this.fullAddress = `${this.buildingNameOrNumber}, ${this.addressLine1}, ${this.addressLine2}, ${this.townOrCity}, ${this.postcode}`
    }
    const dataObject = this.modelToDynamics()

    await super.save(context, dataObject)
  }
}

Address.setDefinitions()

module.exports = Address
