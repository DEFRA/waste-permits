'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')

module.exports = class Address extends BaseModel {
  static mapping () {
    return [
      {field: 'id', dynamics: 'defra_addressid'},
      {field: 'postcode', dynamics: 'defra_postcode'}
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
        return Address.dynamicsToModel(result)
      } catch (error) {
        LoggingService.logError(`Unable to get Address ID: ${error}`)
        throw error
      }
    }
  }

  async save (authToken) {
    const dataObject = this.modelToDynamics()
    await super.save(authToken, dataObject)
  }
}
