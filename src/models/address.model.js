'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')

module.exports = class Address extends BaseModel {
  static mapping () {
    return [
      {field: 'id', dynamics: 'defra_addressid'},
      {field: 'buildingNameOrNumber', dynamics: 'defra_premises'},
      {field: 'addressLine1', dynamics: 'defra_street'},
      {field: 'addressLine2', dynamics: 'defra_locality'},
      {field: 'townOrCity', dynamics: 'defra_towntext'},
      {field: 'postcode', dynamics: 'defra_postcode'},
      {field: 'uprn', dynamics: 'defra_uprn'},
      {field: 'fromAddressLookup', dynamics: 'defra_fromaddresslookup'}
    ]
  }

  constructor (...args) {
    super(...args)
    this._entity = 'defra_addresses'
  }

  static async getById (authToken, id) {
    let address
    if (id) {
      const dynamicsDal = new DynamicsDalService(authToken)
      const query = `defra_addresses(${id})`
      try {
        const result = await dynamicsDal.search(query)
        address = Address.dynamicsToModel(result)
      } catch (error) {
        LoggingService.logError(`Unable to get Address ID: ${error}`)
        throw error
      }
    }
    return address
  }

  static async getByUprn (authToken, uprn) {
    if (!authToken) {
      const errorMessage = `Unable to get ${this._entity} by UPRN: Auth Token not supplied`
      LoggingService.logError(errorMessage)
      throw new Error(errorMessage)
    }

    let address
    const dynamicsDal = new DynamicsDalService(authToken)
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
    } catch (error) {
      LoggingService.logError(`Unable to list addresses by postcode: ${error}`)
      throw error
    }

    return addresses
  }

  async save (authToken) {
    const dataObject = this.modelToDynamics()
    await super.save(authToken, dataObject)
  }
}
