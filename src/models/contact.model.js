'use strict'

const DynamicsService = require('../services/dynamics.service')
const BaseModel = require('./base.model')

module.exports = class Contact extends BaseModel {
  constructor (contact = undefined) {
    super()
    if (contact) {
      this.id = contact.contactid
      this.firstname = contact.firstname
      this.lastname = contact.lastname
      this.telephone1 = contact.telephone1
      this.emailaddress1 = contact.emailaddress1
    }
  }

  static getById (id) {
    // TODO
    // Define the query
    // const query = 'contacts?$select=contactid'
    // const response = dynamicsService.getItem(query)

    // TODO get this from Dynamics instead
    const contactDetails = {
      contactid: id,
      firstname: 'Alan',
      lastname: 'Cruikshanks',
      telephone1: '020 3025 4033',
      emailaddress1: 'alan.cruikshanks@environment-agency.gov.uk'
    }
    return new Contact(contactDetails)
  }

  static async list (authToken) {
    const dynamicsService = new DynamicsService(authToken)

    // Define the query
    const query = 'contacts?$select=contactid,firstname,lastname'

    // List the Contacts
    const contacts = []
    try {
      const response = await dynamicsService.listItems(query)

      // Parse response into Contact objects
      response.forEach((contact) => {
        contacts.push(new Contact(contact))
      })
    } catch (error) {
      // TODO: Error handling?
      console.error(`Unable to list Contacts: ${error}`)
      throw error
    }
    return contacts
  }

  async save (authToken) {
    const dynamicsService = new DynamicsService(authToken)

    // Map the Contact to the corresponding Dynamics schema Contact object
    const dataObject = {
      firstname: this.firstname,
      lastname: this.lastname
    }

    try {
      let query
      if (!this.contactid) {
        // New contact
        query = 'contacts'
        return await dynamicsService.createItem(dataObject, query)
      } else {
        // Update contact
        query = `contacts(${this.contactid})`
        return await dynamicsService.updateItem(dataObject, query)
      }
    } catch (error) {
      // TODO: Error handling?
      console.error(`Unable to create Contact: ${error}`)
      throw error
    }
  }
}
