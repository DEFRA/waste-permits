'use strict'

const BaseModel = require('./base.model')

class ApplicationContact extends BaseModel {
  static get entity () {
    return 'defra_applicationcontacts'
  }

  static get mapping () {
    return [
      { field: 'id', dynamics: 'defra_applicationcontactid' },
      { field: 'applicationId', dynamics: '_defra_applicationid_value', bind: { id: 'defra_applicationid', entity: 'defra_applications' } },
      { field: 'contactId', dynamics: '_defra_contactid_value', bind: { id: 'defra_contactid', entity: 'contacts' } },
      { field: 'directorDob', dynamics: 'defra_dobcompanieshouse' }
    ]
  }

  static async get (context, applicationId, contactId) {
    return super.getBy(context, { applicationId, contactId })
  }

  static async listByApplicationId (context, applicationId) {
    return super.listBy(context, { applicationId })
  }
}

ApplicationContact.setDefinitions()

module.exports = ApplicationContact
