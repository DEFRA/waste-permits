'use strict'

const BaseEntity = require('./base.entity')

class ApplicationContact extends BaseEntity {
  static get dynamicsEntity () {
    return 'defra_applicationcontacts'
  }

  static get mapping () {
    return [
      { field: 'id', dynamics: 'defra_applicationcontactid' },
      { field: 'applicationId', dynamics: '_defra_applicationid_value', bind: { id: 'defra_applicationid', dynamicsEntity: 'defra_applications' } },
      { field: 'contactId', dynamics: '_defra_contactid_value', bind: { id: 'defra_contactid', dynamicsEntity: 'contacts' } },
      { field: 'directorDob', dynamics: 'defra_dobcompanieshouse' }
    ]
  }

  static async get (context, applicationId, contactId) {
    return super.getBy(context, { applicationId, contactId })
  }

  static async getByApplicationId (context, applicationId) {
    return super.getBy(context, { applicationId })
  }

  static async listByApplicationId (context, applicationId) {
    return super.listBy(context, { applicationId })
  }
}

ApplicationContact.setDefinitions()

module.exports = ApplicationContact
