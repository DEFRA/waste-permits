'use strict'

const DynamicsDalService = require('../../services/dynamicsDal.service')
const BaseModel = require('./base.entity')
const LoggingService = require('../../services/logging.service')

class Address extends BaseModel {
  static get dynamicsEntity () {
    return 'defra_addresses'
  }

  static get mapping () {
    return [
      { field: 'id', dynamics: 'defra_addressid' },
      { field: 'buildingNameOrNumber', dynamics: 'defra_premises', length: { max: 50 } },
      { field: 'addressLine1', dynamics: 'defra_street', length: { max: 80 } },
      { field: 'addressLine2', dynamics: 'defra_locality', length: { max: 80 } },
      { field: 'townOrCity', dynamics: 'defra_towntext', length: { max: 30 } },
      { field: 'postcode', dynamics: 'defra_postcode', length: { max: 8 } },
      { field: 'uprn', dynamics: 'defra_uprn', encode: true, length: { max: 20 } },
      { field: 'fromAddressLookup', dynamics: 'defra_fromaddresslookup' },
      { field: 'fullAddress', dynamics: 'defra_name', length: { max: 450 } }
    ]
  }

  static async getByUprn (context, uprn) {
    return super.getBy(context, { uprn })
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

  async save (context, fields) {
    // Build the address name (i.e. the full address) if it is a manual address entry
    if (!this.fromAddressLookup) {
      this.fullAddress = [
        this.buildingNameOrNumber,
        this.addressLine1,
        this.addressLine2,
        this.townOrCity,
        this.postcode
      ].filter((item) => item).join(', ')
      // Make sure the full address will be included if the fields to save have been listed
      if (fields && fields.indexOf('fullAddress') === -1) {
        fields.push('fullAddress')
      }
    }

    await super.save(context, fields)
  }
}

Address.setDefinitions()

module.exports = Address
