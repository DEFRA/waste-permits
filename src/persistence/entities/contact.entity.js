'use strict'

const dynamicsDal = require('../../services/dynamicsDal.service')
const BaseEntity = require('./base.entity')
const Application = require('./application.entity')
const LoggingService = require('../../services/logging.service')

class Contact extends BaseEntity {
  static get dynamicsEntity () {
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
    let filter = `accountrolecode eq ${contactType} and defra_resignedoncompanieshouse eq null`
    if (permitHolderOrganisationId) {
      filter += ` and parentcustomerid_account/accountid eq ${permitHolderOrganisationId}`
    }
    let orderBy = 'lastname asc,firstname asc'
    const query = `contacts?$select=${Contact.selectedDynamicsFields()}${filter ? `&$filter=${filter}` : ''}&$orderby=${orderBy}`

    try {
      const response = await dynamicsDal.search(query)

      // Parse response into Contact objects
      return response.value.map((contact) => Contact.dynamicsToEntity(contact))
    } catch (error) {
      LoggingService.logError(`Unable to list Contacts: ${error}`)
      throw error
    }
  }

  static async getByApplicationId (context) {
    const { applicationId } = context
    const application = await Application.getById(context, applicationId)
    if (application.contactId) {
      return Contact.getById(context, application.contactId)
    }
  }

  static async getByFirstnameLastnameEmail (context, firstName, lastName, email) {
    return this.getBy(context, { firstName, lastName, email })
  }
}

Contact.setDefinitions()

module.exports = Contact
