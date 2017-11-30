'use strict'

const LoggingService = require('../services/logging.service')
const DynamicsDalService = require('../services/dynamicsDal.service')

module.exports = class BaseModel {
  toString () {
    // Class name
    let returnValue = `${this.constructor.name}: {\n`

    // Properties
    for (let key in this) {
      if (this.hasOwnProperty(key) && typeof this[key] !== 'function') {
        returnValue += `  ${key}: ${this[key]},\n`
      }
    }
    // Strip the final comma and append closing brace
    returnValue = returnValue.replace(/,([^,]*)$/, '$1')
    returnValue += `}`

    return returnValue
  }

  isNew () {
    return !this.id
  }

  async save (authToken, dataObject) {
    const dynamicsDal = new DynamicsDalService(authToken)
    try {
      let query
      if (this.isNew()) {
        // New Entity
        query = this.entity
        this.id = await dynamicsDal.create(query, dataObject)
      } else {
        // Update Entity
        query = `${this.entity}(${this.id})`
        await dynamicsDal.update(query, dataObject)
      }
    } catch (error) {
      LoggingService.logError(`Unable to save ${this.entity}: ${error}`)
      throw error
    }
  }
}
