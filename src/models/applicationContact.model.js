'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')
const Utilities = require('../utilities/utilities')

module.exports = class ApplicationContact extends BaseModel {
  constructor (applicationContact) {
    super()
    this.entity = 'defra_applicationcontacts'
    if (applicationContact) {
      this.id = applicationContact.id
      this.directorDob = applicationContact.directorDob
      this.applicationId = applicationContact.applicationId
      this.contactId = applicationContact.contactId
    }
    Utilities.convertFromDynamics(this)
  }

  static selectedDynamicsFields () {
    return [
      'defra_applicationcontactid',
      '_defra_applicationid_value',
      '_defra_contactid_value',
      'defra_dobcompanieshouse'
    ]
  }

  static async get (authToken, applicationId, contactId) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const filter = `_defra_applicationid_value eq ${applicationId} and _defra_contactid_value eq ${contactId}`
    const query = `defra_applicationcontacts?$select=${ApplicationContact.selectedDynamicsFields()}&$filter=${filter}`
    let applicationContact
    try {
      const response = await dynamicsDal.search(query)
      const result = response.value[0]
      if (result) {
        applicationContact = new ApplicationContact({
          id: result.defra_applicationcontactid,
          directorDob: result.defra_dobcompanieshouse,
          applicationId: result._defra_applicationid_value,
          contactId: result._defra_contactid_value
        })
      }
    } catch (error) {
      LoggingService.logError(`Unable to get ApplicationContact by ID: ${error}`)
      throw error
    }
    return applicationContact
  }

  async save (authToken) {
    // Map the ApplicationContact to the corresponding Dynamics schema ApplicationContact object
    const dataObject = {
      defra_dobcompanieshouse: this.directorDob,
      'defra_applicationid@odata.bind': `/defra_applications(${this.applicationId})`,
      'defra_contactid@odata.bind': `/contacts(${this.contactId})`
    }
    await super.save(authToken, dataObject)
  }
}
