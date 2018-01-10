
'use strict'

const Constants = require('../constants')
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')
const Utilities = require('../utilities/utilities')

module.exports = class Contact extends BaseModel {
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
    const query = `defra_applicationcontacts?$select=${Contact.selectedDynamicsFields()}&$filter=${filter}`
    let applicationContact

    console.log('####QUERY:', query)


    try {
      const response = await dynamicsDal.search(query)

      console.log('#### RESPONSE:',  response)
      // applicationContact = new ApplicationContact({
      //   id: response.contactid,
      //   firstName: response.firstname,
      //   lastName: response.lastname,
      //   telephone: response.telephone1,
      //   email: response.emailaddress1,
      //   dob: {
      //     day: response.defra_dateofbirthdaycompanieshouse,
      //     month: response.defra_dobmonthcompanieshouse,
      //     year: response.defra_dobyearcompanieshouse
      //   }
      // })
    } catch (error) {
      LoggingService.logError(`Unable to get ApplicationContact by ID: ${error}`)
      throw error
    }
    return applicationContact
  }

  // TODO remove this?
  // List the ApplicationContact records for the application ID
  // static async list (authToken, applicationId) {
  //   const dynamicsDal = new DynamicsDalService(authToken)

  //   // TODO
  //   // let filter = ``
  //   const filter = `_defra_applicationid_value eq ${applicationId}`
  //   // let filter = `accountrolecode eq ${contactType} and defra_resignedoncompanieshouse eq null`
  //   // if (accountId) {
  //   //   filter += ` and parentcustomerid_account/accountid eq ${accountId}`
  //   // }
  //   // let orderBy = 'lastname asc,firstname asc'
  //   const query = `defra_applicationcontacts?$select=${Contact.selectedDynamicsFields()}&$filter=${filter}`

  //   try {
  //     const response = await dynamicsDal.search(query)

  //     // Parse response into Contact objects
  //     return response.value.map((applicationContact) => new ApplicationContact({
  //       id: applicationContact.defra_applicationcontactid,
  //       // firstName: contact.firstname,
  //       // lastName: contact.lastname,
  //       // telephone: contact.telephone1,
  //       // email: contact.emailaddress1,
  //       // dob: {
  //       //   day: contact.defra_dateofbirthdaycompanieshouse,
  //       //   month: contact.defra_dobmonthcompanieshouse,
  //       //   year: contact.defra_dobyearcompanieshouse
  //       // }
  //     }))
  //   } catch (error) {
  //     LoggingService.logError(`Unable to list ApplicationContacts: ${error}`)
  //     throw error
  //   }
  // }

  async save (authToken) {
    // Map the ApplicationContact to the corresponding Dynamics schema ApplicationContact object
    const dataObject = {
      defra_dobcompanieshouse: this.directorDob,
      'defra_applicationid@odata.bind': `/defra_applications(${this.applicationId})`,
      'defra_contactid@odata.bind': `/contacts(${this.contactId})`
    }
    console.log('####SAVING:', dataObject)
    await super.save(authToken, dataObject)
  }
}
