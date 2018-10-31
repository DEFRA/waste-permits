'use strict'

const { CONTACT_DETAILS } = require('./taskList').CompletedParameters
const BaseTask = require('./base.task')
const ContactDetail = require('../../models/contactDetail.model')
const { PRIMARY_CONTACT_DETAILS } = require('../../dynamics').AddressTypes

module.exports = class ContactDetails extends BaseTask {
  static get completenessParameter () {
    return CONTACT_DETAILS
  }

  static async checkComplete (context) {
    const type = PRIMARY_CONTACT_DETAILS.TYPE
    const contactDetail = await ContactDetail.get(context, { type })
    return Boolean(contactDetail && contactDetail.firstName && contactDetail.lastName && contactDetail.telephone && contactDetail.email)
  }
}
