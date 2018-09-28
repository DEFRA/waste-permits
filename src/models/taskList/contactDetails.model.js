'use strict'

const { CONTACT_DETAILS } = require('../taskList/taskList.model').CompletedParameters
const Completeness = require('./completeness.model')
const Contact = require('../../../src/models/contact.model')

module.exports = class ContactDetails extends Completeness {
  static get completenessParameter () {
    return CONTACT_DETAILS
  }

  static async checkComplete (context, applicationId) {
    const contact = await Contact.getByApplicationId(context, applicationId)
    return Boolean(contact.firstName)
  }
}
