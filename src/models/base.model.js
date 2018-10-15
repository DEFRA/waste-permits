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

  static get mapping () {
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
    //    {field: 'name', dynamics: 'defra_name', constant: 'Constant Value'},
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

  static get relationships () {
    return {
      // The following example links the Model to the Account model via the dynamics relationship defra_contact_account:
      // Account: 'defra_contact_account'
    }
  }

  static setDefinitions () {
    // This method adds properties to the model class itself to allow a reference to each field definition in the mapping.
    // For example if the mapping for "class Model" contains a mapping definition of [{field: 'blah', dynamics: 'defra_blah'}]
    // then it will be possible to access the dynamics property as follows:
    // "Model.blah.dynamics" which would have the value of "defra_blah"
    this.mapping.forEach((definition) => {
      this[definition.field] = definition
    })
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
    return this.mapping
      .filter(customFilter)
      // ignore constant and writeonly values as they will not be retrieved from dynamics
      .filter(({ constant, writeOnly }) => !constant && !writeOnly)
      .map(({ dynamics }) => dynamics)
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
    this.mapping
    // See the explanation of a custom filter in the method selectedDynamicsFields above.
      .filter(customFilter)
      .forEach(({ field, dynamics, constant, isDate }) => {
        // set values in javascript objects by specifying a path eg 'dob.month'.
        // if the path doesn't exist yet, it will be created.
        let val = dynamicsData[dynamics]
        if (isDate && val) {
          val = new Date(val)
        }
        ObjectPath.set(modelData, field, constant || val)
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
    const { mapping, name } = this.constructor
    const dynamicsData = {}
    mapping
    // See the explanation of a custom filter in the method selectedDynamicsFields above
      .filter(customFilter)
      // ignore readonly values as they will only be set when reading from dynamics
      .filter(({ readOnly }) => !readOnly)
      .forEach(({ field, dynamics, constant, bind, isDate, length }) => {
        const value = this[field]
        // check the value in the field meets the length constraints if applicable
        if (length && typeof value === 'string') {
          if (length.max && value.length > length.max) {
            const errorMessage = `${name}.${field} exceeds maximum length of ${length.max} characters`
            LoggingService.logError(errorMessage)
            throw new Error(errorMessage)
          }
          if (length.min && value.length < length.min) {
            const errorMessage = `${name}.${field} does not meet minimum length of ${length.min} characters`
            LoggingService.logError(errorMessage)
            throw new Error(errorMessage)
          }
        }
        if (bind) {
          if (value) {
            dynamicsData[`${bind.id}@odata.bind`] = `${bind.entity}(${value})`
          }
        } else {
          if (value === undefined && constant !== undefined) {
            dynamicsData[dynamics] = constant
          } else {
            if (value !== undefined || field !== 'id') {
              const val = ObjectPath.get(this, field)
              dynamicsData[dynamics] = isDate && val !== undefined ? new Date(val).toISOString() : val
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
    const model = { ...this }
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

  static async getById (context = {}, id, customFilter = () => true) {
    // See the explanation of a custom filter in the method selectedDynamicsFields above
    let model
    let cachedData = context[Utilities.firstCharToLowercase(this.name)]
    if (id) {
      if (cachedData && cachedData.id === id) {
        return cachedData
      }
      const dynamicsDal = new DynamicsDalService(context.authToken)
      const query = `${this.entity}(${id})`
      try {
        const result = await dynamicsDal.search(query)
        model = this.dynamicsToModel(result, customFilter)
        model.id = id
      } catch (error) {
        LoggingService.logError(`Unable to get ${this.name} ID: ${error}`)
        throw error
      }
    }
    return model
  }

  static _buildQuerySelect (filterData = {}, orderByFields = '') {
    // This method builds a search query based on filter data, orderby fields and mapping.
    //
    // For example, when the mapping for Account is:
    // [
    //    {field: 'id', dynamics: 'defra_id'},
    //    {field: 'age', dynamics: 'defra_age'},
    //    {field: 'firstName', dynamics: 'defra_firstname', encode: true},
    //    {field: 'lastName', dynamics: 'defra_lastname', encode: true},
    //    {field: 'date.day', dynamics: 'defra_date_day', readOnly: true},
    //    {field: 'date.month', dynamics: 'defra_date_month', readOnly: true},
    //    {field: 'date.year', dynamics: 'defra_date_year', readOnly: true},
    //    {field: 'type', dynamics: 'defra_type', constant: 'TYPE'}
    //    {field: 'secret', dynamics: 'defra_secret', writeOnly: true}
    //    {field: 'contactId', dynamics: '_defra_primarycontactid_value', bind: {id: 'defra_primarycontactid', entity: 'contacts'}}
    // ]
    //
    // And the filterData is:
    // {
    //    age: '30',
    //    firstName: 'Fred',
    //    lastName: 'Blogs'
    // }
    //
    // And the orderBy is 'age, lastName'
    //
    // Then the select portion of the query that is generated within the code below will be:
    // "$select=defra_id, defra_age, defra_firstname, defra_lastname, defra_date_day, defra_date_month, defra_date_year, _defra_primarycontactid_value&$filter=defra_age eq 30 and defra_firstname eq 'Fred' and defra_lastname eq 'Blogs'&$orderby=defra_age asc defra_lastname asc"
    //
    let filter = Object.entries(Utilities.convertToDynamics(filterData))
      .map(([field, val]) => `${this[field].dynamics} eq ${this[field].encode ? `'${encodeURIComponent(val)}'` : val}`)
      .join(' and ')

    let orderBy = orderByFields.split(' ')
      .filter((fieldName) => fieldName)
      .map((fieldName) => `${this[fieldName].dynamics} asc`)
      .join(' ')

    return `$select=${this.selectedDynamicsFields()}${filter ? `&$filter=${filter}` : ''}${orderBy ? `&$orderby=${orderBy}` : ''}`
  }

  static async getBy (context = {}, filterData = {}) {
    return (await this.listBy(context, filterData)).pop()
  }

  static async listBy (context = {}, filterData = {}, orderByFields = '') {
    const dynamicsDal = new DynamicsDalService(context.authToken)
    const query = `${this.entity}?${this._buildQuerySelect(filterData, orderByFields)}`
    try {
      const response = await dynamicsDal.search(query)
      return response.value.map((result) => this.dynamicsToModel(result))
    } catch (error) {
      LoggingService.logError(`Unable to list ${this.name} by ${JSON.stringify(filterData)}: ${error}`)
      throw error
    }
  }

  async listLinked (context = {}, linked = this, filterData = {}, orderByFields = '') {
    const { entity, relationships } = this.constructor
    const { name: linkedModel } = linked.constructor
    const dynamicsDal = new DynamicsDalService(context.authToken)
    const query = `${entity}(${this.id})/${relationships[linkedModel]}?${linked.constructor._buildQuerySelect(filterData, orderByFields)}`
    try {
      const response = await dynamicsDal.search(query)
      return response.value.map((result) => linked.constructor.dynamicsToModel(result))
    } catch (error) {
      LoggingService.logError(`Unable to list linked ${linked.name} by ${JSON.stringify(filterData)}: ${error}`)
      throw error
    }
  }

  async _deleteBoundReferences (dynamicsDal, fields) {
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
    const { entity, mapping } = this.constructor
    const boundMapping = mapping
      .filter(({ bind }) => bind && bind.relationship) // only those fields that have a relationship with another entity
      .filter(({ field }) => !fields || fields.indexOf(field) !== -1) // only those in the fields array if it has been entered
      .filter(({ field }) => !this[field]) // only those where the value of the field has been cleared
    if (boundMapping.length) {
      // select all the cleared references of entities bound to this entity and get their original values
      const selectedFields = boundMapping.map(({ dynamics }) => dynamics).join(',')
      const entityQuery = `${entity}(${this.id})?$select=${selectedFields}`
      const result = await dynamicsDal.search(entityQuery)
      // using the original value of each reference, build the query and delete the bound reference
      let deleteCalls = boundMapping.map(async ({ dynamics, bind: { relationship, entity } }) => {
        const ref = result[dynamics]
        if (ref) {
          const deleteQuery = `${entity}(${ref})/${relationship}(${this.id})/$ref`
          await dynamicsDal.delete(deleteQuery)
        }
        return Promise.resolve()
      })
      await Promise.all(deleteCalls)
    }
  }

  async save (context = {}, fields) {
    let fieldsFilter
    if (fields) {
      // Only include those fields listed
      fieldsFilter = ({ field }) => fields.indexOf(field) !== -1
    }

    const dataObject = this.modelToDynamics(fieldsFilter)

    const { entity, readOnly } = this.constructor
    if (readOnly) {
      const errorMessage = `Unable to save ${entity}: Read only!`
      LoggingService.logError(errorMessage)
      throw new Error(errorMessage)
    }

    if (!context) {
      const errorMessage = `Unable to save ${entity}: Context not supplied`
      LoggingService.logError(errorMessage)
      throw new Error(errorMessage)
    }

    const dynamicsDal = new DynamicsDalService(context.authToken)
    try {
      let query
      if (this.isNew()) {
        // New Entity
        query = entity
        this.id = await dynamicsDal.create(query, dataObject)
      } else {
        await this._deleteBoundReferences(dynamicsDal, fields)
        // Update Entity
        query = `${entity}(${this.id})`
        await dynamicsDal.update(query, dataObject)
      }
    } catch (error) {
      LoggingService.logError(`Unable to save ${entity}: ${error}`)
      throw error
    }
  }

  async delete (context = {}, id = this.id) {
    const { entity, readOnly } = this.constructor
    if (readOnly) {
      const errorMessage = `Unable to delete ${entity}: Read only!`
      LoggingService.logError(errorMessage)
      throw new Error(errorMessage)
    }
    const dynamicsDal = new DynamicsDalService(context.authToken)
    try {
      let query = `${entity}(${id})`
      await dynamicsDal.delete(query)
    } catch (error) {
      LoggingService.logError(`Unable to delete ${entity} with id ${id}: ${error}`)
      throw error
    }
  }

  async link (context = {}, linked) {
    const { entity, relationships } = this.constructor
    const dynamicsDal = new DynamicsDalService(context.authToken)
    const { entity: linkedEntity, name: linkedModel } = linked.constructor
    const association = {
      '@odata.id': `${dynamicsDal.dynamicsPath}${linkedEntity}(${linked.id})`
    }
    const query = `${entity}(${this.id})/${relationships[linkedModel]}/$ref`
    return dynamicsDal.link(query, association)
  }

  async unLink (context = {}, linked) {
    const { entity, relationships } = this.constructor
    const dynamicsDal = new DynamicsDalService(context.authToken)
    const { name: linkedModel } = linked.constructor
    const query = `${entity}(${this.id})/${relationships[linkedModel]}(${linked.id})/$ref`
    return dynamicsDal.delete(query)
  }
}
