'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const uuid4 = require('uuid/v4')

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

  static getById (id) {
    // TODO
    // Define the query
    // const query = 'contacts?$select=contactid'
    // const response = dynamicsDalService.getItem(query)

    // TODO get this from Dynamics instead
    const contactDetails = {
      id: uuid4(),
      firstName: 'Alan',
      lastName: 'Cruikshanks',
      telephone: '020 3025 4033',
      email: 'alan.cruikshanks@environment-agency.gov.uk'
    }
    return new Contact(contactDetails)
  }

  static async list (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)

    // Define the query
    const query = 'contacts?$select=contactid,firstname,lastname,telephone1,emailaddress1'

    // List the Contacts
    const contacts = []
    try {
      const response = await dynamicsDal.listItems(query)

      // Parse response into Contact objects
      response.forEach((contact) => {
        contacts.push(new Contact({
          id: contact.contactid,
          firstName: contact.firstname,
          lastName: contact.lastname,
          telephone: contact.telephone1,
          email: contact.emailaddress1
        }))
      })
    } catch (error) {
      // TODO: Error handling?
      console.error(`Unable to list Contacts: ${error}`)
      throw error
    }
    return contacts
  }

  async save (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)

    // Map the Contact to the corresponding Dynamics schema Contact object
    const dataObject = {
      firstname: this.firstName,
      lastname: this.lastName
    }

    try {
      let query
      if (!this.contactid) {
        // New contact
        query = 'contacts'
        return await dynamicsDal.createItem(dataObject, query)
      } else {
        // Update contact
        query = `contacts(${this.contactid})`
        return await dynamicsDal.updateItem(dataObject, query)
      }
    } catch (error) {
      // TODO: Error handling?
      console.error(`Unable to create Contact: ${error}`)
      throw error
    }
  }
}
