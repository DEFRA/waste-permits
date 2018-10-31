'use strict'

const moment = require('moment')
const Constants = require('../constants')
const Routes = require('../routes')
const Utilities = require('../utilities/utilities')
const BaseController = require('./base.controller')
const LoggingService = require('../services/logging.service')
const RecoveryService = require('../services/recovery.service')
const ContactDetail = require('../models/contactDetail.model')
const Contact = require('../persistence/entities/contact.entity')

const {
  AddressTypes: { DESIGNATED_MEMBER_CONTACT_DETAILS, DIRECTOR_CONTACT_DETAILS },
  PERMIT_HOLDER_TYPES: { LIMITED_COMPANY, LIMITED_LIABILITY_PARTNERSHIP }
} = require('../dynamics')

module.exports = class DirectorDateOfBirthController extends BaseController {
  _getContactType (permitHolderType) {
    switch (permitHolderType) {
      case LIMITED_COMPANY:
        return DIRECTOR_CONTACT_DETAILS.TYPE
      case LIMITED_LIABILITY_PARTNERSHIP:
        return DESIGNATED_MEMBER_CONTACT_DETAILS.TYPE
      default:
        throw new Error(`Unexpected permit holder type: ${permitHolderType.type}`)
    }
  }

  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h, { account: true })
    const { applicationId, account, permitHolderType } = context

    if (!account) {
      const message = `Application ${applicationId} does not have an Account`
      LoggingService.logError(message, request)
      return this.redirect({ request, h, redirectPath: Routes.TECHNICAL_PROBLEM.path, error: { message } })
    }

    // Get the directors that relate to this application
    const directors = await this._getDirectors(context, applicationId, account.id)
    const companies = await account.listLinked(context)
    const type = this._getContactType(permitHolderType)
    const contactDetails = await ContactDetail.list(context, { type })

    // Add the day of birth to each Director's date of birth from the ContactDetail (if we have it)
    directors.forEach((director) => {
      const contactDetail = contactDetails.find(({ customerId }) => customerId === director.id)
      if (contactDetail && contactDetail.dateOfBirth) {
        director.dob.day = Utilities.extractDayFromDate(contactDetail.dateOfBirth)
      }
    })

    const validator = new this.validator.constructor()

    validator.setErrorMessages(directors)

    const pageContext = this.createPageContext(request, errors, validator)
    pageContext.directors = directors
    pageContext.companies = companies

    if (directors.length > 1) {
      pageContext.pageHeading = this.route.pageHeadingAlternate
      pageContext.pageTitle = Constants.buildPageTitle(this.route.pageHeadingAlternate)

      // Change page title if there is an error using the following
      if (errors && errors.details) {
        pageContext.pageTitle = `${Constants.PAGE_TITLE_ERROR_PREFIX} ${pageContext.pageTitle}`
      }
    }

    if (request.payload) {
      pageContext.directors.forEach((director, index) => {
        director.dob.day = request.payload[`director-dob-day-${index}`] || ''
      })
    }

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h, { account: true })
    const { applicationId, account, permitHolderType } = context
    if (!account) {
      const message = `Application ${applicationId} does not have an Account`
      LoggingService.logError(message, request)
      return this.redirect({ request, h, redirectPath: Routes.TECHNICAL_PROBLEM.path, error: { message } })
    }

    const directors = await this._getDirectors(context, applicationId, account.id)

    // Perform manual (non-Joi) validation of dynamic form content
    errors = await this._validateDynamicFormContent(request, directors)

    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      // Save Director dates of birth in their corresponding ContactDetail record
      const type = this._getContactType(permitHolderType)
      const contactDetails = await ContactDetail.list(context, { type })

      // Add the day of birth to each Director's date of birth from the ContactDetail (if we have it)
      await Promise.all(directors.map(async ({ dob, id, firstName, lastName }, index) => {
        const contactDetail = contactDetails.find(({ customerId }) => customerId === id) || new ContactDetail({
          applicationId,
          customerId: id,
          type
        })

        dob.day = request.payload[`director-dob-day-${index}`]
        contactDetail.dateOfBirth = Utilities.formatDateForPersistence(dob)
        contactDetail.firstName = firstName
        contactDetail.lastName = lastName
        contactDetail.organisationType = permitHolderType.dynamicsOrganisationTypeId
        contactDetail.applicationId = applicationId

        return contactDetail.save(context)
      }))

      return this.redirect({ request, h, redirectPath: this.nextPath })
    }
  }

  // Obtains the Directors that relate to an application
  async _getDirectors (context, applicationId, permitHolderOrganisationId) {
    const directors = await Contact.list(context, permitHolderOrganisationId, this.route.officerRole)
    for (let director of directors) {
      director.dateOfBirthFormatted = Utilities.formatDateForDisplay(director.dob)
    }
    return directors
  }

  // This is required because the number of directors that relate to an application is variable,
  // depending on which company is chosen to relate to the application. It has not been possible to
  // validate the varying number of day of birth fieds using the standard Joi validation methods.
  async _validateDynamicFormContent (request, directors) {
    let errors

    // If there are are no DOBs entered
    if (Object.keys(request.payload).length === 0) {
      const errorPath = 'director-dobs-not-entered'
      errors = {
        details: [
          {
            message: `"${errorPath}" is required`,
            path: [errorPath],
            type: 'any.required',
            context: { key: errorPath, label: errorPath }
          }]
      }
    } else {
      // Clear errors
      errors = {
        details: []
      }

      // Validate the entered DOB for each director
      for (let i = 0; i < directors.length; i++) {
        const director = directors[i]
        const directorDobField = `director-dob-day-${i}`
        let dobDay = request.payload[directorDobField]

        if (dobDay === undefined) {
          // DOB day has not been entered
          errors.details.push({
            message: `"${directorDobField}" is required`,
            path: [directorDobField],
            type: 'any.required',
            context: { key: directorDobField, label: directorDobField }
          })
        } else {
          let daysInBirthMonth = moment(`${director.dob.year}-${director.dob.month}`, 'YYYY-MM').daysInMonth()
          daysInBirthMonth = isNaN(daysInBirthMonth) ? 31 : daysInBirthMonth

          dobDay = parseInt(dobDay)
          if (isNaN(dobDay) || dobDay < 1 || dobDay > daysInBirthMonth) {
            // DOB day is invalid
            errors.details.push({
              message: `"${directorDobField}" is invalid`,
              path: [directorDobField],
              type: 'invalid',
              context: { key: directorDobField, label: directorDobField }
            })
          }
        }
      }
    }

    if (errors && errors.details.length === 0) {
      errors = undefined
    }

    return errors
  }
}
