'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')

module.exports = class Address extends BaseModel {
  // constructor (address) {
  //   super()
  //   this.entity = 'defra_addresses'
  //   if (address) {
  //     this.id = address.id
  //     this.buildingNameOrNumber = address.buildingNameOrNumber
  //     this.addressLine1 = address.addressLine1
  //     this.addressLine2 = address.addressLine2
  //     this.postcode = address.postcode
  //     this.fullAddress = address.fullAddress
  //     this.uprn = address.uprn
  //     this.fromAddressLookup = address.fromAddressLookup
  //   }
  //   Utilities.convertFromDynamics(this)

  static mapping () {
    return [
      {field: 'id', dynamics: 'defra_addressid'},
      {field: 'buildingNameOrNumber', dynamics: 'defra_premises'},
      {field: 'addressLine1', dynamics: 'defra_street'},
      {field: 'addressLine2', dynamics: 'defra_locality'},
      {field: 'townOrCity', dynamics: '_defra_town_value', bind: {id: 'defra_Town', entity: 'defra_towns'}},
      {field: 'postcode', dynamics: 'defra_postcode'},
      // {field: 'fullAddress', dynamics: 'address'}, readOnly: true ???
      {field: 'uprn', dynamics: 'defra_uprn'},
      {field: 'fromAddressLookup', dynamics: 'defra_fromaddresslookup'}
    ]
  }

  constructor (...args) {
    super(...args)
    this._entity = 'defra_addresses'
  }

  static async getById (authToken, id) {
    if (id) {
      const dynamicsDal = new DynamicsDalService(authToken)
      const query = `defra_addresses(${id})`
      try {
        const result = await dynamicsDal.search(query)
// <<<<<<< HEAD
//         if (result) {
//           address = new Address({
//             id: result.defra_addressid,
//             buildingNameOrNumber: result.premises,
//             addressLine1: result.street_address,
//             addressLine2: result.locality,
//             postcode: result.defra_postcode,
//             fullAddress: result.address,
//             uprn: result.uprn,
//             fromAddressLookup: result.defra_fromaddresslookup
//           })
//         }
// =======
        return Address.dynamicsToModel(result)
      } catch (error) {
        LoggingService.logError(`Unable to get Address ID: ${error}`)
        throw error
      }
    }
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
      // addresses = addresses.map((address) => Address.dynamicsToModel(address))

      addresses = addresses.map((address) => new Address({
        id: undefined,
        buildingNameOrNumber: address.premises,
        addressLine1: address.street_address,
        addressLine2: address.locality,
        postcode: address.postcode,
        fullAddress: address.address,
        uprn: address.uprn,
        fromAddressLookup: address.fromAddressLookup
      }))
    } catch (error) {
      LoggingService.logError(`Unable to list addresses by postcode: ${error}`)
      throw error
    }

    return addresses
  }

  async save (authToken) {
// <<<<<<< HEAD
//     // Map the Address to the corresponding Dynamics schema Address object
//     const dataObject = {
//       defra_postcode: this.postcode

//       // TODO check if we always have uprn, or if not does it matter?
//       // If from ABF lookup
//       // defra_fromaddresslookup = 1 (yes)
//       // uprn = this.uprn

//       // If from manual entry
//       // defra_fromaddresslookup = 0 (yes)
//     }

//     dataObject.defra_fromaddresslookup = this.fromAddressLookup ? 1 : 0
// =======
    const dataObject = this.modelToDynamics()

    await super.save(authToken, dataObject)
  }
}
