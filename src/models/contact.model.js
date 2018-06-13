'use strict'

const Constants = require('../constants')
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const Application = require('./application.model')
const LoggingService = require('../services/logging.service')

class Contact extends BaseModel {
  static get entity () {
    return 'contacts'
  }

  static get mapping () {
    return [
      {field: 'id', dynamics: 'contactid'},
      {field: 'firstName', dynamics: 'firstname', length: {max: 50}},
      {field: 'lastName', dynamics: 'lastname', length: {max: 50}},
      {field: 'email', dynamics: 'emailaddress1', length: {max: 100}},
      {field: 'dob.day', dynamics: 'defra_dateofbirthdaycompanieshouse', readOnly: true},
      {field: 'dob.month', dynamics: 'defra_dobmonthcompanieshouse', readOnly: true},
      {field: 'dob.year', dynamics: 'defra_dobyearcompanieshouse', readOnly: true}
    ]
  }

  static selectedDynamicsFields (customFilter) {
    return super.selectedDynamicsFields(customFilter)
    // Do not retrieve the director date of birth
      .filter((field) => field !== 'dob.day')
  }

  static async getById (context, id) {
    return super.getById(context, id, ({field}) => field !== 'dob.day')
  }

  static async list (context, permitHolderOrganisationId = undefined, contactType = Constants.Dynamics.COMPANY_DIRECTOR) {
    const dynamicsDal = new DynamicsDalService(context.authToken)

    let filter = `accountrolecode eq ${contactType} and defra_resignedoncompanieshouse eq null`
    if (permitHolderOrganisationId) {
      filter += ` and parentcustomerid_account/accountid eq ${permitHolderOrganisationId}`
    }
    let orderBy = 'lastname asc,firstname asc'
    const query = `contacts?$select=${Contact.selectedDynamicsFields()}&$filter=${filter}&$orderby=${orderBy}`

    try {
      const response = await dynamicsDal.search(query)

      // Parse response into Contact objects
      return response.value.map((contact) => Contact.dynamicsToModel(contact))
    } catch (error) {
      LoggingService.logError(`Unable to list Contacts: ${error}`)
      throw error
    }
  }

  static async getIndividualPermitHolderByApplicationId (context, applicationId) {
    const dynamicsDal = new DynamicsDalService(context.authToken)
    const application = await Application.getById(context, applicationId)
    if (application.individualPermitHolderId()) {
      try {
        const query = encodeURI(`contacts(${application.individualPermitHolderId()})?$select=${Contact.selectedDynamicsFields()}`)
        const result = await dynamicsDal.search(query)
        if (result) {
          return Contact.dynamicsToModel(result)
        }
      } catch (error) {
        LoggingService.logError(`Unable to get Individual Permit Holder by application ID: ${error}`)
        throw error
      }
    }
  }

  static async getByApplicationId (context, applicationId) {
    const dynamicsDal = new DynamicsDalService(context.authToken)
    const application = await Application.getById(context, applicationId)
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

  static async getByFirstnameLastnameEmail (context, firstName, lastName, email) {
    const dynamicsDal = new DynamicsDalService(context.authToken)
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

  async save (context) {
    const dataObject = this.modelToDynamics()
    await super.save(context, dataObject)
  }
}

Contact.setDefinitions()

module.exports = Contact
