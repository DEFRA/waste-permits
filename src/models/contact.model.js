
'use strict'

const Constants = require('../constants')
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')
const Utilities = require('../utilities/utilities')

module.exports = class Contact extends BaseModel {
  constructor (contact) {
    super()
    this.entity = 'contacts'
    if (contact) {
      this.id = contact.id
      this.firstName = contact.firstName
      this.lastName = contact.lastName
      this.telephone = contact.telephone
      this.email = contact.email
      this.dob = {
        day: contact.dob.day,
        month: contact.dob.month,
        year: contact.dob.year
      }
    }
    Utilities.convertFromDynamics(this)
  }

  static async getById (authToken, id) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const query = `contacts(${id})?$select=contactid,firstname,lastname,telephone1,emailaddress1`
    let contact

    try {
      const response = await dynamicsDal.search(query)

      contact = new Contact({
        id: response.contactid,
        firstName: response.firstname,
        lastName: response.lastname,
        telephone: response.telephone1,
        email: response.emailaddress1,
        dob: {
          day: response.defra_dateofbirthdaycompanieshouse,
          month: response.defra_dobmonthcompanieshouse,
          year: response.defra_dobyearcompanieshouse
        }
      })
    } catch (error) {
      LoggingService.logError(`Unable to get Contact by ID: ${error}`)
      throw error
    }
    return contact
  }

  static async list (authToken, accountId = undefined, contactType = Constants.Dynamics.COMPANY_DIRECTOR) {
    const dynamicsDal = new DynamicsDalService(authToken)

    let select = 'contactid,firstname,fullname,lastname,telephone1,emailaddress1,defra_dateofbirthdaycompanieshouse,defra_dobmonthcompanieshouse,defra_dobyearcompanieshouse'
    let filter = `accountrolecode eq ${contactType} and defra_resignedoncompanieshouse eq null`
    if (accountId) {
      filter += `and parentcustomerid_account/accountid eq ${accountId}`
    }
    let orderBy = 'lastname asc,firstname asc'
    const query = `contacts?$select=${select}&$filter=${filter}&$orderby=${orderBy}`

    try {
      const response = await dynamicsDal.search(query)

      // Parse response into Contact objects
      return response.value.map((contact) => new Contact({
        id: contact.contactid,
        firstName: contact.firstname,
        lastName: contact.lastname,
        telephone: contact.telephone1,
        email: contact.emailaddress1,
        dob: {
          day: contact.defra_dateofbirthdaycompanieshouse,
          month: contact.defra_dobmonthcompanieshouse,
          year: contact.defra_dobyearcompanieshouse
        }
      }))
    } catch (error) {
      LoggingService.logError(`Unable to list Contacts: ${error}`)
      throw error
    }
  }

  async save (authToken) {
    // Map the Contact to the corresponding Dynamics schema Contact object
    const dataObject = {
      firstname: this.firstName,
      lastname: this.lastName,
      telephone1: this.telephone,
      emailaddress1: this.email,
      defra_dateofbirthdaycompanieshouse: this.dob.day,
      defra_dobmonthcompanieshouse: this.dob.month,
      defra_dobyearcompanieshouse: this.dob.year
    }
    await super.save(authToken, dataObject)
  }
}
