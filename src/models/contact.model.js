'use strict'

const DynamicsService = require('../services/dynamics.service')
const BaseModel = require('./base.model')

module.exports = class Contact extends BaseModel {
  constructor (contact = undefined) {
    super()
    if (contact) {
      this.id = contact.id
      this.contactName = contact.contactName
      this.contactTelephone = contact.contactTelephone
      this.contactEmail = contact.contactEmail
    }
  }

  isValid () {
    // TODO validation
    return (typeof this.contactName !== 'undefined' && this.contactName !== '' &&
      typeof this.contactTelephone !== 'undefined' && this.contactTelephone !== '' &&
      typeof this.contactEmail !== 'undefined' && this.contactEmail !== '')
  }

  // Converts full name string into first name and last name for Dynamics
  convertObject () {
    const dataObject = {}

    let nameParts = this.contactName.split(' ')
    const firstName = nameParts[0]

    nameParts.splice(0, 1)
    let lastName = nameParts.join(' ')
    dataObject['firstname'] = firstName
    dataObject['lastname'] = lastName

    return dataObject
  }

  static getById (id) {
    // TODO
    // Define the query
    // const query = 'contacts?$select=contactid'
    // const response = dynamicsService.getItem(query)

    // TODO get this from Dynamics instead
    const contactDetails = {
      id: id,
      contactName: 'xxxxxx',
      contactTelephone: 'yyyyy',
      contactEmail: 'zzzzz'
    }
    return new Contact(contactDetails)
  }

  static async list (crmToken) {
    const dynamicsService = new DynamicsService(crmToken)

    // Define the query
    const query = 'contacts?$select=fullname,contactid'

    // List the Contacts
    const contacts = []
    try {
      const response = await dynamicsService.listItems(query)

      // Parse response into Contact objects
      response.forEach((contact) => {
        contacts.push(new Contact({
          // TODO: Transform Contact objects?
          // i.e. map from Dynamics Contact objects into application Contact objects
          contactName: contact.fullname,
          contactTelephone: '12345',
          contactEmail: '123@email.com'
        }))
      })
    } catch (error) {
      // TODO: Error handling?
      console.error(`Unable to list Contacts: ${error}`)
      throw error
    }
    return contacts
  }

  async save (crmToken) {
    const dynamicsService = new DynamicsService(crmToken)

    // Map the Contact to the corresponding Dynamics schema Contact object
    const dataObject = this.convertObject()

    try {
      let query
      if (!this.id) {
        // New contact
        query = 'contacts'
        return await dynamicsService.createItem(dataObject, query)
      } else {
        // Update contact
        query = `contacts(${this.id})`
        return await dynamicsService.updateItem(dataObject, query)
      }
    } catch (error) {
      // TODO: Error handling?
      console.error(`Unable to create Contact: ${error}`)
      throw error
    }
  }
}
