'use strict'

const moment = require('moment')
const Constants = require('../constants')
const BaseController = require('./base.controller')
const DirectorDateOfBirthValidator = require('../validators/directorDateOfBirth.validator')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const Account = require('../models/account.model')
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

    const directors = await this._getDirectors(authToken, account.id)

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

    pageContext.hasDirectors = pageContext.directors.length > 0

    if (request.payload) {
      // If we have data payload then re-display in the form by saving the data against each Director
      for (let fieldName of Object.keys(request.payload)) {
        // Get the direcor index
        let fieldIndex = fieldName.substring(fieldName.lastIndexOf('-') + 1)

        // Set the director date of birth day with the corresonding value in the payload
        directors[fieldIndex].dob.day = request.payload[fieldName]
      }
    } else {
    // TODO
    // Load existing directors into the page
    //   pageContext.formValues = {
    //     'site-name': await SiteNameAndLocation.getSiteName(request, authToken, applicationId, applicationLineId)
    //   }
    }

    return reply.view('directorDateOfBirth', pageContext)
  }

  async doPost (request, reply, errors) {
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)

    let account = await Account.getByApplicationId(authToken, applicationId)
    if (!account) {
      // TODO apply this when the account has been created in Dynamics by the previous screen
      LoggingService.logError(`Application ${applicationId} does not have an Account`, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }

    const directors = await this._getDirectors(authToken, account.id)

    // Perform manual (non-Joi) validation of dynamic form content
    errors = await this._validateDynamicFormContent(request, directors)

    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      // TODO save DOBs to Dynamics

      // Iterate director-dob-day-x
      //request.payload['site-name']

      // Set director day of birth (contacts)
      // director.dob.day

      // console.log(request.payload)

      // Save contacts

      // await SiteNameAndLocation.saveSiteName(request, request.payload['site-name'],
      //   authToken, applicationId, applicationLineId)

      return reply.redirect(Constants.Routes.COMPANY_DECLARE_OFFENCES.path)
    }
  }

  async _getDirectors (authToken, accountId) {
    let contacts = await Contact.list(authToken, accountId, Constants.Dynamics.COMPANY_DIRECTOR)

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

  async _validateDynamicFormContent (request, directors) {
    let errors

    // If there are are no DOBs entered
    if (Object.keys(request.payload).length === 0) {
      errors = {
        data: {
          details: [
            {
              message: '"director-dobs-not-entered" is required',
              path: ['director-dobs-not-entered'],
              type: 'any.required',
              context: { key: 'director-dobs-not-entered', label: 'director-dobs-not-entered' }
            }]
        }
      }
    } else {
      errors = {
        data: {
          details: []
        }
      }

      // Validate the entered DOB for each director
      for (let i = 0; i < directors.length; i++) {
        let director = directors[i]
        let dobDay = request.payload[`director-dob-day-${i}`]

        if (dobDay === undefined) {
          // DOB day has not been entered
          errors.data.details.push({
            message: `"director-dob-day-${i}" is required`,
            path: `director-dob-day-${i}`,
            type: 'any.required',
            context: { key: `director-dob-day-${i}`, label: `director-dob-day-${i}` }
          })
        } else {
          let daysInBirthMonth = moment(`${director.dob.year}-${director.dob.month}`, 'YYYY-MM').daysInMonth()
          daysInBirthMonth = isNaN(daysInBirthMonth) ? 31 : daysInBirthMonth

          dobDay = parseInt(dobDay)
          if (isNaN(dobDay) || dobDay < 1 || dobDay > daysInBirthMonth) {
            // DOB day is invalid
            errors.data.details.push({
              message: `"director-dob-day-${i}" is invalid`,
              path: `director-dob-day-${i}`,
              type: 'invalid',
              context: { key: `director-dob-day-${i}`, label: `director-dob-day-${i}` }
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
