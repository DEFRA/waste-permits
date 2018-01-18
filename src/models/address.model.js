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
      this.postcode = address.postcode
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
      const data = await dynamicsDal.callAction(action, actionDataObject)

      // console.log('#####data:', data)

      // TODO
    //   // Parse response into Address objects
    //   return response.value.map((contact) => new Address({
    //     id: contact.contactid,
    //     buildingNameOrNumber: contact.firstname,
    //     addressLine1: contact.lastname,
    //     addressLine2: contact.telephone1,
    //     postcode: contact.emailaddress1,
    //   }))
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
