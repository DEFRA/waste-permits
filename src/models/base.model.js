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

  static mapping () {
    // This method should be overridden by the derived class to specify a model to dynamics mapping.
    //
    // The following example maps the model field: 'name' to a dynamics field: 'defra_name':
    // [
    //    {field: 'name', dynamics: 'defra_name'},
    // ]
    //
    // The following example is read only and will not be included when saving to dynamics:
    // [
    //    {field: 'name', dynamics: 'defra_name', readOnly: true},
    // ]
    //
    // The following example is a constant and so will not be retrieved from dynamics, but will be included when saving a new instance on dynamics:
    // [
    //    {field: 'name', dynamics: 'defra_name', constant: 'Constant Value},
    // ]
    //
    // The following example maps the model field: 'locationId' to a dynamics field: '_defra_locationid_value' which is bound to a dynamics entity 'defra_locations' where the id is 'defra_locationId':
    // [
    //    {field: 'locationId', dynamics: '_defra_locationid_value', bind: {id: 'defra_locationId', entity: 'defra_locations'}}
    // ]
    //
    //
    return []
  }

  static selectedDynamicsFields (customFilter = () => true) {
    // This method returns an array of dynamics field names retrieved from the mapping method.
    // Note that a custom filter can be used to include only those mappings that are required.
    //
    // For example, when the mapping for Account is:
    // [
    //    {field: 'id', dynamics: 'defra_id'},
    //    {field: 'age', dynamics: 'defra_age'},
    //    {field: 'name', dynamics: 'defra_name'},
    //    {field: 'type', dynamics: 'defra_type', constant: 'TYPE'}
    // ]
    //
    // And selectedDynamicsFields is executed as follows:
    // Account.selectedDynamicsFields((field) => field !== 'id')
    //
    // Then the result would be:
    // ['defra_age', 'defra_name']
    //
    // Note the following:
    // - The defra_id field is missing as the custom filter has omitted it.
    // - The defra_type field is missing as it is a constant as specified in the mapping.
    //
    return this.mapping()
      .filter(customFilter)
      // ignore readonly values as they will only be set when reading from dynamics
      .filter(({constant}) => !constant)
      .map(({dynamics}) => dynamics)
  }

  static dynamicsToModel (dynamicsData, customFilter = () => true) {
    // This method returns a new instance of a model with fields populated by supplied dynamics data mapped as specified in the mapping method.
    // Note that a custom filter can be used to include only those mappings that are required.
    //
    // For example, when the mapping for Account is:
    // [
    //    {field: 'id', dynamics: 'defra_id'},
    //    {field: 'age', dynamics: 'defra_age'},
    //    {field: 'name', dynamics: 'defra_name'},
    //    {field: 'date.day', dynamics: 'defra_date_day', readOnly: true},
    //    {field: 'date.month', dynamics: 'defra_date_month', readOnly: true},
    //    {field: 'date.year', dynamics: 'defra_date_year', readOnly: true},
    //    {field: 'type', dynamics: 'defra_type', constant: 'TYPE'}
    // ]
    //
    // And the dynamics data is:
    // {
    //    defra_id: '43acb872-19ca-e711-8112-5065f38a5b01',
    //    defra_age: '30',
    //    defra_name: 'Fred',
    //    defra_date_day: '20',
    //    defra_date_month: '05',
    //    defra_date_year: '88'
    // }
    //
    // And dynamicsToModel is executed as follows:
    // Account.dynamicsToModel(dynamicsData, ({dynamics}) => dynamics !== 'defra_date_day')
    //
    // Then the result would be:
    // {
    //    id: '43acb872-19ca-e711-8112-5065f38a5b01',
    //    age: '30',
    //    name: 'Fred',
    //    age: '30',
    //    date: {
    //       month: '05',
    //       year: '88'},
    //    type: 'TYPE'
    // }
    //
    // Note the following:
    // - The day field is missing as the custom filter has omitted it.
    // - The type field has been added with the value of 'TYPE' as specified in the mapping.
    //
    const modelData = {}
    this.mapping()
    // See the explanation of a custom filter in the method selectedDynamicsFields above.
      .filter(customFilter)
      .forEach(({field, dynamics, constant}) => {
        // set values in javascript objects by specifying a path eg 'dob.month'.
        // if the path doesn't exist yet, it will be created.
        ObjectPath.set(modelData, field, constant || dynamicsData[dynamics])
      })
    return new this(modelData)
  }

  modelToDynamics (customFilter = () => true) {
    // This method returns dynamics data retrieved with fields populated from the model mapped as specified in the mapping method.
    // Note that a custom filter can be used to include only those mappings that are required.
    //
    // For example, when the mapping for Account is:
    // [
    //    {field: 'id', dynamics: 'defra_id'},
    //    {field: 'age', dynamics: 'defra_age'},
    //    {field: 'name', dynamics: 'defra_name'},
    //    {field: 'date.day', dynamics: 'defra_date_day', readOnly: true},
    //    {field: 'date.month', dynamics: 'defra_date_month', readOnly: true},
    //    {field: 'date.year', dynamics: 'defra_date_year', readOnly: true},
    //    {field: 'type', dynamics: 'defra_type', constant: 'TYPE'}
    //    {field: 'contactId', dynamics: '_defra_primarycontactid_value', bind: {id: 'defra_primarycontactid', entity: 'contacts'}}
    // ]
    //
    // And the account model is:
    // {
    //    id: '43acb872-19ca-e711-8112-5065f38a5b01',
    //    contactId: '10b88e9b-abaa-e711-8114-5065f38a3b21',
    //    age: '30',
    //    name: 'Fred',
    //    date: {
    //       day: '20',
    //       month: '05',
    //       year: '88'}
    // }
    //
    // And modelToDynamics is executed as follows:
    // account.modelToDynamics(dynamicsData, ({dynamics}) => dynamics !== 'defra_age')
    //
    // Then the result would be:
    // {
    //    defra_id: '43acb872-19ca-e711-8112-5065f38a5b01',
    //    defra_name: 'Fred',
    //    defra_type: 'TYPE',
    //    defra_primarycontactid@odata.bind: 'contacts(10b88e9b-abaa-e711-8114-5065f38a3b21)'
    // }
    //
    // Note the following:
    // - The defra_date fields are missing as they are readOnly in the mapping.
    // - The defra_age field is missing as the custom filter has omitted it.
    // - The defra_type field has been added with the value of 'TYPE' as specified in the mapping.
    // - The dynamics account entity has been bound to the contacts entity via the contactId
    //
    const dynamicsData = {}
    this.constructor.mapping()
    // See the explanation of a custom filter in the method selectedDynamicsFields above
      .filter(customFilter)
      // ignore readonly values as they will only be set when reading from dynamics
      .filter(({readOnly}) => !readOnly)
      .forEach(({field, dynamics, constant, bind}) => {
        if (bind) {
          if (this[field]) {
            dynamicsData[`${bind.id}@odata.bind`] = `${bind.entity}(${this[field]})`
          }
        } else {
          if (this[field] === undefined && constant !== undefined) {
            dynamicsData[dynamics] = constant
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
    const model = Object.assign({}, this, {_entity: undefined}) // ignore the private _entity property
    let properties = JSON.stringify(model).replace(/{/g, '{\n  ')
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
    // This method deletes any bound references as specified in the mapping method if the new value of any key is undefined.
    //
    // For example, when the mapping for Account is:
    // [
    //    {field: 'id', dynamics: 'defra_id'},
    //    {field: 'contactId', dynamics: '_defra_primarycontactid_value', bind: {id: 'defra_primarycontactid', relationship: 'defra_contact_defra_application_primarycontactid', entity: 'contacts'}}
    // ]
    //
    // And the previous value for the contactId is '10b88e9b-abaa-e711-8114-5065f38a3b21'
    //
    // And the account model is:
    // {
    //    id: '43acb872-19ca-e711-8112-5065f38a5b01',
    //    contactId: undefined
    // }
    //
    // Then the deleteQuery that is generated within the code below will be:
    // 'contacts(10b88e9b-abaa-e711-8114-5065f38a3b21)/defra_contact_defra_application_primarycontactid(43acb872-19ca-e711-8112-5065f38a5b01)/$ref'
    //
    const boundMapping = this.constructor.mapping()
      .filter(({bind}) => bind && bind.relationship) // only those fields that have a relationship with another entity
      .filter(({field}) => !this[field]) // only those where the value of the field has been cleared
    if (boundMapping.length) {
      // select all the cleared references of entities bound to this entity and get their original values
      const selectedFields = boundMapping.map(({dynamics}) => dynamics).join(',')
      const entityQuery = `${this._entity}(${this.id})?$select=${selectedFields}`
      const result = await dynamicsDal.search(entityQuery)
      // using the original value of each reference, build the query and delete the bound reference
      boundMapping.forEach(async ({dynamics, bind: {relationship, entity}}) => {
        const ref = result[dynamics]
        if (ref) {
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
        query = this._entity
        this.id = await dynamicsDal.create(query, dataObject)
      } else {
        if (this.constructor.mapping) {
          await this._deleteBoundReferences(dynamicsDal)
        }
        // Update Entity
        query = `${this._entity}(${this.id})`
        await dynamicsDal.update(query, dataObject)
      }
    } catch (error) {
      LoggingService.logError(`Unable to save ${this._entity}: ${error}`)
      throw error
    }
  }

  async delete (authToken, id) {
    const dynamicsDal = new DynamicsDalService(authToken)
    try {
      let query = `${this._entity}(${id})`
      await dynamicsDal.delete(query)
    } catch (error) {
      LoggingService.logError(`Unable to delete ${this._entity} with id ${id}: ${error}`)
      throw error
    }
  }
}
