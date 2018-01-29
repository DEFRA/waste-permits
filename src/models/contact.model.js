'use strict'

const Constants = require('../constants')
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const Application = require('./application.model')
const LoggingService = require('../services/logging.service')

module.exports = class Contact extends BaseModel {
  static mapping () {
    return [
      {field: 'id', dynamics: 'contactid'},
      {field: 'firstName', dynamics: 'firstname'},
      {field: 'lastName', dynamics: 'lastname'},
      {field: 'email', dynamics: 'emailaddress1'},
      {field: 'dob.day', dynamics: 'defra_dateofbirthdaycompanieshouse', readOnly: true},
      {field: 'dob.month', dynamics: 'defra_dobmonthcompanieshouse', readOnly: true},
      {field: 'dob.year', dynamics: 'defra_dobyearcompanieshouse', readOnly: true}
    ]
  }

  constructor (...args) {
    super(...args)
    this._entity = 'contacts'
  }

  static async getById (authToken, id) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const query = `contacts(${id})?$select=${Contact.selectedDynamicsFields((field) => field !== 'defra_dateofbirthdaycompanieshouse')}`
    try {
      const result = await dynamicsDal.search(query)
      return Contact.dynamicsToModel(result)
    } catch (error) {
      LoggingService.logError(`Unable to get Contact by ID: ${error}`)
      throw error
    }
  }

  static async list (authToken, accountId = undefined, contactType = Constants.Dynamics.COMPANY_DIRECTOR) {
    const dynamicsDal = new DynamicsDalService(authToken)

    let filter = `accountrolecode eq ${contactType} and defra_resignedoncompanieshouse eq null`
    if (accountId) {
      filter += ` and parentcustomerid_account/accountid eq ${accountId}`
    }
    let orderBy = 'lastname asc,firstname asc'
    const query = `contacts?$select=${Contact.selectedDynamicsFields((field) => field !== 'defra_dateofbirthdaycompanieshouse')}&$filter=${filter}&$orderby=${orderBy}`

    try {
      const response = await dynamicsDal.search(query)

      // Parse response into Contact objects
      return response.value.map((contact) => Contact.dynamicsToModel(contact))
    } catch (error) {
      LoggingService.logError(`Unable to list Contacts: ${error}`)
      throw error
    }
  }

  static async getByApplicationId (authToken, applicationId) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const application = await Application.getById(authToken, applicationId)
    if (application.contactId) {
      try {
        const query = encodeURI(`contacts(${application.contactId})?$select=${Contact.selectedDynamicsFields()}`)
        const result = await dynamicsDal.search(query)
        if (result) {
          return Contact.dynamicsToModel(result)
        }
      } catch (error) {
        LoggingService.logError(`Unable to get Contact by application ID: ${error}`)
        throw error
      }
    }
  }

  static async getByFirstnameLastnameEmail (authToken, firstName, lastName, email) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const filter = `firstname eq '${firstName}' and lastname eq '${lastName}' and emailaddress1 eq '${encodeURIComponent(email)}'`
    const query = `contacts?$select=${this.selectedDynamicsFields()}&$filter=${filter}`
    try {
      const response = await dynamicsDal.search(query)
      const result = response && response.value ? response.value.pop() : undefined
      if (result) {
        return this.dynamicsToModel(result)
      }
    } catch (error) {
      LoggingService.logError(`Unable to get ${this.name} by firstName(${firstName}) and lastName(${lastName}) and email(${email})): ${error}`)
      throw error
    }
  }

  async save (authToken) {
    const dataObject = this.modelToDynamics()
    await super.save(authToken, dataObject)
  }
}
