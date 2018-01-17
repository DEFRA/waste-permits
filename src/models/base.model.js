'use strict'

const ObjectPath = require('object-path')
const LoggingService = require('../services/logging.service')
const DynamicsDalService = require('../services/dynamicsDal.service')
const Utilities = require('../utilities/utilities')

module.exports = class BaseModel {
  constructor (...args) {
    const data = args.pop()
    if (data) {
      Object.assign(this, data)
    }
    Utilities.convertFromDynamics(this)
  }

  static selectedDynamicsFields (filter = () => true) {
    return this.mapping()
      .filter(filter)
      .map(({dynamics}) => dynamics)
  }

  static dynamicsToModel (dynamicsData, filter = () => true) {
    const modelData = {}
    this.mapping()
      .filter(filter)
        // ignore default values as they will only be set when writing to dynamics
      .filter(({defaultVal}) => !defaultVal)
      .forEach(({field, dynamics}) => {
        // set values in javascript objects by specifying a path eg 'dob.month'.
        // if the path doesn't exist yet, it will be created.
        ObjectPath.set(modelData, field, dynamicsData[dynamics])
      })
    return new this(modelData)
  }

  modelToDynamics (filter = () => true) {
    const dynamicsData = {}
    this.constructor.mapping()
      .filter(filter)
      // ignore readonly values as they will only be set when reading from dynamics
      .filter(({readOnly}) => !readOnly)
      .forEach(({field, dynamics, defaultVal, bind}) => {
        if (bind) {
          if (this[field]) {
            dynamicsData[`${bind.id}@odata.bind`] = `${bind.entity}(${this[field]})`
          }
        } else {
          if (this[field] === undefined && defaultVal !== undefined) {
            dynamicsData[dynamics] = defaultVal
          } else {
            if (this[field] !== undefined || field !== 'id') {
              dynamicsData[dynamics] = ObjectPath.get(this, field)
            }
          }
        }
      })
    return dynamicsData
  }

  toString () {
    // Class name
    const className = this.constructor.name

    // Properties
    let properties = JSON.stringify(this).replace(/{/g, '{\n  ')
    properties = properties.replace(/}/g, '\n}')
    properties = properties.replace(/,/g, ', ')
    properties = properties.replace(/:/g, ': ')
    properties = properties.replace(/\\"/g, '')

    return `${className}: ${properties}`
  }

  isNew () {
    return !this.id
  }

  async _deleteBoundReferences (dynamicsDal) {
    // if there are any bound references in the mapping, delete those that have been cleared
    const boundMapping = this.constructor.mapping().filter(({bind}) => bind && bind.relationship)
    if (boundMapping.length) {
      // select all the references of entities bound to this entity and get their original values
      const selectedFields = boundMapping.map(({dynamics}) => dynamics).join(',')
      const entityQuery = `${this.entity}(${this.id})?$select=${selectedFields}`
      const result = await dynamicsDal.search(entityQuery)
      // when the reference has been cleared, use the original reference, build the query and delete the bound reference
      boundMapping.forEach(async ({field, dynamics, bind: {relationship, entity}}) => {
        const ref = result[dynamics]
        if (ref && !this[field]) {
          const deleteQuery = `${entity}(${ref})/${relationship}(${this.id})/$ref`
          await dynamicsDal.delete(deleteQuery)
        }
      })
    }
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
        if (this.constructor.mapping) {
          await this._deleteBoundReferences(dynamicsDal)
        }
        // Update Entity
        query = `${this.entity}(${this.id})`
        await dynamicsDal.update(query, dataObject)
      }
    } catch (error) {
      LoggingService.logError(`Unable to save ${this.entity}: ${error}`)
      throw error
    }
  }

  async delete (authToken, id) {
    const dynamicsDal = new DynamicsDalService(authToken)
    try {
      let query = `${this.entity}(${id})`
      await dynamicsDal.delete(query)
    } catch (error) {
      LoggingService.logError(`Unable to delete ${this.entity} with id ${id}: ${error}`)
      throw error
    }
  }
}
