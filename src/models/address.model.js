'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')
const Utilities = require('../utilities/utilities')

module.exports = class Address extends BaseModel {
  constructor (address) {
    super()
    this.id = address.id
    this.postcode = address.postcode
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

  async save (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)
    try {
      // Map the Address to the corresponding Dynamics schema Address object
      const dataObject = {
        defra_postcode: this.postcode
      }

      let query
      if (this.isNew()) {
        // New Address
        query = 'defra_addresses'
        this.id = await dynamicsDal.create(query, dataObject)
      } else {
        // Update Address
        query = `defra_addresses(${this.id})`
        await dynamicsDal.update(query, dataObject)
      }
    } catch (error) {
      LoggingService.logError(`Unable to save Address: ${error}`)
      throw error
    }
  }
}
