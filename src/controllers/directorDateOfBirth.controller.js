'use strict'

const moment = require('moment')
const Constants = require('../constants')
const BaseController = require('./base.controller')
const DirectorDateOfBirthValidator = require('../validators/directorDateOfBirth.validator')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const Account = require('../models/account.model')
const ApplicationContact = require('../models/applicationContact.model')
const Contact = require('../models/contact.model')

module.exports = class DirectorDateOfBirthController extends BaseController {
  async doGet (request, reply, errors) {
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)

    let account = await Account.getByApplicationId(authToken, applicationId)
    if (!account) {
      LoggingService.logError(`Application ${applicationId} does not have an Account`, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }

    const directors = await this._getDirectors(authToken, applicationId, account.id)

    const directorDateOfBirthValidator = new DirectorDateOfBirthValidator()
    directorDateOfBirthValidator.setErrorMessages(directors)

    const pageContext = this.createPageContext(errors, directorDateOfBirthValidator)
    pageContext.directors = directors

    if (directors.length > 1) {
      pageContext.pageHeading = Constants.Routes.DIRECTOR_DATE_OF_BIRTH.pageHeadingAlternate
      pageContext.pageTitle = Constants.buildPageTitle(Constants.Routes.DIRECTOR_DATE_OF_BIRTH.pageHeadingAlternate)

      // Change page title if there is an error using the following
      if (errors && errors.data.details) {
        pageContext.pageTitle = `${Constants.PAGE_TITLE_ERROR_PREFIX} ${pageContext.pageTitle}`
      }
    }

    if (request.payload) {
      for (let i = 0; i < directors.length; i++) {
        let field = request.payload[`director-dob-day-${i}`]
        pageContext.directors[i].dob.day = field || ''
      }
    }
    return reply.view('directorDateOfBirth', pageContext)
  }

  async doPost (request, reply, errors) {
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)

    let account = await Account.getByApplicationId(authToken, applicationId)
    if (!account) {
      LoggingService.logError(`Application ${applicationId} does not have an Account`, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }

    const directors = await this._getDirectors(authToken, applicationId, account.id)

    // Perform manual (non-Joi) validation of dynamic form content
    errors = await this._validateDynamicFormContent(request, directors)

    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      // Save Director dates of birth in their corresponding ApplicationContact record
      for (let i = 0; i < directors.length; i++) {
        const director = directors[i]
        director.dob.day = parseInt(request.payload[`director-dob-day-${i}`])

        console.log('##########director=', director)

        // Get the ApplicationContact for this application
        let applicationContact = await ApplicationContact.get(authToken, applicationId, director.id)
        if (!applicationContact) {
          // Create a ApplicationContact in Dynamics
          applicationContact = new ApplicationContact({
            directorDob: this._formatDateOfBirth(director.dob),
            applicationId: applicationId,
            contactId: director.id
          })
        } else {
          // Update existing ApplicationContact

          // TODO build DOB 2018-01-25 as a shared function
          applicationContact.directorDob = this._formatDateOfBirth(director.dob)
        }
        await applicationContact.save(authToken)
      }

      return reply.redirect(Constants.Routes.COMPANY_DECLARE_OFFENCES.path)
    }
  }

  async _getDirectors (authToken, applicationId, accountId) {

    // const [contacts, applicationContacts] = await Promise.all([
    //   Contact.list(authToken, accountId, Constants.Dynamics.COMPANY_DIRECTOR)

    //   // TODO decide if we want this?
    //   // ApplicationContact.list(authToken, applicationId)
    // ])

    // TODO use applicationContacts

    const contacts = await Contact.list(authToken, accountId, Constants.Dynamics.COMPANY_DIRECTOR)

    for (let director of contacts) {
      if (director.dob && director.dob.month && director.dob.year) {
        let month = director.dob.month.toString()
        if (month && month.length === 1) {
          // Pad with a leading zero if required
          month = '0' + month
        }
        director.dateOfBirthFormatted = moment(`${director.dob.year}-${month}-01`).format('MMMM YYYY')
      } else {
        director.dateOfBirthFormatted = 'Unknown date'
      }
    }
    return contacts
  }

  _formatDateOfBirth (dob) {
    return `${dob.year}-${dob.month}-${dob.day}`
  }

  async _validateDynamicFormContent (request, directors) {
    let errors

    // If there are are no DOBs entered
    if (Object.keys(request.payload).length === 0) {
      const errorPath = 'director-dobs-not-entered'
      errors = {
        data: {
          details: [
            {
              message: `"${errorPath}" is required`,
              path: [errorPath],
              type: 'any.required',
              context: { key: errorPath, label: errorPath }
            }]
        }
      }
    } else {
      // Clear errors
      errors = {
        data: {
          details: []
        }
      }

      // Validate the entered DOB for each director
      for (let i = 0; i < directors.length; i++) {
        const director = directors[i]
        const directorDobField = `director-dob-day-${i}`
        let dobDay = request.payload[directorDobField]

        if (dobDay === undefined) {
          // DOB day has not been entered
          errors.data.details.push({
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
            errors.data.details.push({
              message: `"${directorDobField}" is invalid`,
              path: [directorDobField],
              type: 'invalid',
              context: { key: directorDobField, label: directorDobField }
            })
          }
        }
      }
    }

    if (errors.data.details.length === 0) {
      errors = undefined
    }

    return errors
  }
}
