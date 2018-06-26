'use strict'

const moment = require('moment')
const Constants = require('../constants')
const Dynamics = require('../dynamics')
const Routes = require('../routes')
const Utilities = require('../utilities/utilities')
const BaseController = require('./base.controller')
const DirectorDateOfBirthValidator = require('../validators/directorDateOfBirth.validator')
const LoggingService = require('../services/logging.service')
const RecoveryService = require('../services/recovery.service')
const ApplicationContact = require('../models/applicationContact.model')
const Contact = require('../models/contact.model')

module.exports = class DirectorDateOfBirthController extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h, {account: true})
    const {applicationId, account} = context

    if (!account) {
      const message = `Application ${applicationId} does not have an Account`
      LoggingService.logError(message, request)
      return this.redirect({request, h, redirectPath: Routes.TECHNICAL_PROBLEM.path, error: {message}})
    }

    // Get the directors that relate to this application
    const directors = await this._getDirectors(context, applicationId, account.id)

    // Add the day of birth to each Director's date of birth from the ApplicationContact (if we have it)
    for (let director of directors) {
      let applicationContact = await ApplicationContact.get(context, applicationId, director.id)
      if (applicationContact && applicationContact.directorDob) {
        director.dob.day = Utilities.extractDayFromDate(applicationContact.directorDob)
      }
    }

    const directorDateOfBirthValidator = new DirectorDateOfBirthValidator()
    directorDateOfBirthValidator.setErrorMessages(directors)

    const pageContext = this.createPageContext(errors, directorDateOfBirthValidator)
    pageContext.directors = directors

    if (directors.length > 1) {
      pageContext.pageHeading = Routes.DIRECTOR_DATE_OF_BIRTH.pageHeadingAlternate
      pageContext.pageTitle = Constants.buildPageTitle(Routes.DIRECTOR_DATE_OF_BIRTH.pageHeadingAlternate)

      // Change page title if there is an error using the following
      if (errors && errors.details) {
        pageContext.pageTitle = `${Constants.PAGE_TITLE_ERROR_PREFIX} ${pageContext.pageTitle}`
      }
    }

    if (request.payload) {
      for (let i = 0; i < directors.length; i++) {
        let field = request.payload[`director-dob-day-${i}`]
        pageContext.directors[i].dob.day = field || ''
      }
    }

    return this.showView({request, h, pageContext})
  }

  async doPost (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h, {account: true})
    const {applicationId, account} = context
    if (!account) {
      const message = `Application ${applicationId} does not have an Account`
      LoggingService.logError(message, request)
      return this.redirect({request, h, redirectPath: Routes.TECHNICAL_PROBLEM.path, error: {message}})
    }

    const directors = await this._getDirectors(context, applicationId, account.id)

    // Perform manual (non-Joi) validation of dynamic form content
    errors = await this._validateDynamicFormContent(request, directors)

    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      // Save Director dates of birth in their corresponding ApplicationContact record
      for (let i = 0; i < directors.length; i++) {
        const director = directors[i]
        director.dob.day = parseInt(request.payload[`director-dob-day-${i}`])

        // Get the ApplicationContact for this application
        let applicationContact = await ApplicationContact.get(context, applicationId, director.id)
        if (!applicationContact) {
          // Create a ApplicationContact in Dynamics
          applicationContact = new ApplicationContact({
            directorDob: Utilities.formatDateForPersistence(director.dob),
            applicationId: applicationId,
            contactId: director.id
          })
        } else {
          // Update existing ApplicationContact
          applicationContact.directorDob = Utilities.formatDateForPersistence(director.dob)
        }
        await applicationContact.save(context)
      }

      return this.redirect({request, h, redirectPath: this.nextPath})
    }
  }

  // Obtains the Directors that relate to an application
  async _getDirectors (context, applicationId, permitHolderOrganisationId) {
    const directors = await Contact.list(context, permitHolderOrganisationId, Dynamics.AccountRoleCodes.COMPANY_DIRECTOR)
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
