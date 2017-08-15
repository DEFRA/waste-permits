'use strict'

const DynamicsService = require('../services/dynamics.service')

module.exports = class Contact {
  constructor (contact) {
    if (contact) {
      this.id = contact.id
      this.contactName = contact.contactName
      this.contactTelephone = contact.contactTelephone
      this.contactEmail = contact.contactEmail
    }
  }

  isValid () {
    // TODO validation
    return (this.contactName && this.contactTelephone && this.contactEmail)
  }

  static getById (id) {
    // TODO Decide if we need this
    // Define the query
    // const query = 'contacts?$select=contactid'
    // const response = dynamicsService.get(query)

    // TODO parse response
    // contactDetails = {
    //   this.contactName = 'x'
    //   this.contactTelephone = 'y'
    //   this.contactEmail = 'z'
    // }
    // return new Contact(contactDetails)
  }

  static async list (crmToken) {
    const dynamicsService = new DynamicsService(crmToken)

    // Define the query
    const query = 'contacts?$select=fullname,contactid'

    // List the Contacts
    const contacts = []
    try {
      const response = await dynamicsService.list(query)

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
      console.error('Unable to list Contacts')
    }
    return contacts
  }

  save (crmToken) {
    const dynamicsService = new DynamicsService(crmToken)

    // Define the query
    const query = 'contacts'

    // TODO: Map the Contact to the corresponding Dynamics schema Contact object
    const dataObject = {}
    dataObject['firstname'] = this.contactName
    dataObject['lastname'] = this.contactTelephone

    try {
      return dynamicsService.create(dataObject, query)
    } catch (error) {
      // TODO: Error handling?
      console.error('Unable to create Contact')
    }
  }

  update (crmToken) {
    const dynamicsService = new DynamicsService(crmToken)

    // Define the query
    const query = 'contacts(' + this.id + ')'

    // TODO: Map the Contact to the corresponding Dynamics schema Contact object
    const dataObject = {}
    dataObject['firstname'] = this.contactName + 'UPDATED'
    dataObject['lastname'] = this.contactTelephone + 'UPDATED'

    // TODO error handling
    return dynamicsService.update(dataObject, query)
  }

  toString () {
    return 'Contact: { \n' +
      '  contactName: ' + this.contactName + '\n' +
      '  contactTelephone: ' + this.contactTelephone + '\n' +
      '  contactEmail: ' + this.contactEmail + '\n' +
      '}'
  }
}
