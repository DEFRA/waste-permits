'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')

class ApplicationContact extends BaseModel {
  static get entity () {
    return 'defra_applicationcontacts'
  }

  static get mapping () {
    return [
      {field: 'id', dynamics: 'defra_applicationcontactid'},
      {field: 'applicationId', dynamics: '_defra_applicationid_value', bind: {id: 'defra_applicationid', entity: 'defra_applications'}},
      {field: 'contactId', dynamics: '_defra_contactid_value', bind: {id: 'defra_contactid', entity: 'contacts'}},
      {field: 'directorDob', dynamics: 'defra_dobcompanieshouse'}
    ]
  }

  static async get (authToken, applicationId, contactId) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const filter = `_defra_applicationid_value eq ${applicationId} and _defra_contactid_value eq ${contactId}`
    const query = `defra_applicationcontacts?$select=${ApplicationContact.selectedDynamicsFields()}&$filter=${filter}`
    try {
      const response = await dynamicsDal.search(query)
      const result = response.value.pop()
      if (result) {
        return ApplicationContact.dynamicsToModel(result)
      }
    } catch (error) {
      LoggingService.logError(`Unable to get ApplicationContact by ID: ${error}`)
      throw error
    }
  }

  async save (authToken) {
    const dataObject = this.modelToDynamics()
    await super.save(authToken, dataObject)
  }
}

ApplicationContact.setDefinitions()

module.exports = ApplicationContact
