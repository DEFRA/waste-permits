'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')

module.exports = class Contact extends BaseModel {
  constructor (dataObject = undefined) {
    super()
    if (dataObject) {
      this.id = dataObject.id
      this.firstName = dataObject.firstName
      this.lastName = dataObject.lastName
      this.telephone = dataObject.telephone
      this.email = dataObject.email
    }
  }

  static async getById (authToken, id) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const query = `contacts(${id})?$select=contactid,firstname,lastname,telephone1,emailaddress1`
    var contact

    try {
      const response = await dynamicsDal.search(query)

      contact = new Contact({
        id: response.contactid,
        firstName: response.firstname,
        lastName: response.lastname,
        telephone: response.telephone1,
        email: response.emailaddress1
      })
    } catch (error) {
      // TODO: Error handling?
      LoggingService.logError(`Unable to list Contacts: ${error}`)
      throw error
    }
    return contact
  }

  static async list (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)

    // Define the query
    const query = 'contacts?$select=contactid,firstname,lastname,telephone1,emailaddress1'

    const contacts = {
      count: 0,
      results: []
    }

    try {
      const response = await dynamicsDal.search(query)

      // Parse response into Contact objects
      response.value.forEach((contact) => {
        contacts.results.push(new Contact({
          id: contact.contactid,
          firstName: contact.firstname,
          lastName: contact.lastname,
          telephone: contact.telephone1,
          email: contact.emailaddress1
        }))
        contacts.count++
      })
    } catch (error) {
      // TODO: Error handling?
      LoggingService.logError(`Unable to list Contacts: ${error}`)
      throw error
    }
    return contacts
  }

  async save (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)

    // Map the Contact to the corresponding Dynamics schema Contact object
    const dataObject = {
      firstname: this.firstName,
      lastname: this.lastName,
      telephone1: this.telephone,
      emailaddress1: this.email
    }

    try {
      let query
      if (this.isNew()) {
        // New contact
        query = 'contacts'
        this.id = await dynamicsDal.create(query, dataObject)
      } else {
        // Update contact
        query = `contacts(${this.id})`
        await dynamicsDal.update(query, dataObject)
      }
    } catch (error) {
      LoggingService.logError(`Unable to save Contact: ${error}`)
      throw error
    }
  }
}
