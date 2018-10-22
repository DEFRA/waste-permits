'use strict'

const { CONTACT_DETAILS } = require('./taskList').CompletedParameters
const BaseTask = require('./base.task')
const Contact = require('../../persistence/entities/contact.entity')

module.exports = class ContactDetails extends BaseTask {
  static get completenessParameter () {
    return CONTACT_DETAILS
  }

  static async checkComplete (context, applicationId) {
    const contact = await Contact.getByApplicationId(context, applicationId)
    return Boolean(contact.firstName)
  }
}
