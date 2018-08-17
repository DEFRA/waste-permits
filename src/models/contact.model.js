'use strict'

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
      { field: 'id', dynamics: 'contactid' },
      { field: 'firstName', dynamics: 'firstname', encode: true, length: { max: 50 } },
      { field: 'lastName', dynamics: 'lastname', encode: true, length: { max: 50 } },
      { field: 'email', dynamics: 'emailaddress1', encode: true, length: { max: 100 } },
      { field: 'dob.month', dynamics: 'defra_dobmonthcompanieshouse', readOnly: true },
      { field: 'dob.year', dynamics: 'defra_dobyearcompanieshouse_text', readOnly: true }
    ]
  }

  static get relationships () {
    return {
      Account: 'defra_contact_account'
    }
  }

  static async list (context, permitHolderOrganisationId = undefined, contactType) {
    const dynamicsDal = new DynamicsDalService(context.authToken)

    let filter = `accountrolecode eq ${contactType} and defra_resignedoncompanieshouse eq null`
    if (permitHolderOrganisationId) {
      filter += ` and parentcustomerid_account/accountid eq ${permitHolderOrganisationId}`
    }
    let orderBy = 'lastname asc,firstname asc'
    const query = `contacts?$select=${Contact.selectedDynamicsFields()}${filter ? `&$filter=${filter}` : ''}&$orderby=${orderBy}`

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
    const application = await Application.getById(context, applicationId)
    const individualPermitHolderId = application.individualPermitHolderId()
    if (individualPermitHolderId) {
      return Contact.getById(context, individualPermitHolderId)
    }
  }

  static async getByApplicationId (context, applicationId) {
    const application = await Application.getById(context, applicationId)
    if (application.contactId) {
      return Contact.getById(context, application.contactId)
    }
  }

  static async getByFirstnameLastnameEmail (context, firstName, lastName, email) {
    return this.getBy(context, { firstName, lastName, email })
  }

  async save (context) {
    const dataObject = this.modelToDynamics()
    await super.save(context, dataObject)
  }
}

Contact.setDefinitions()

module.exports = Contact
