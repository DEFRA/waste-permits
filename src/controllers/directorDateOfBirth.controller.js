'use strict'

const moment = require('moment')
const Constants = require('../constants')
const BaseController = require('./base.controller')
const DirectorDateOfBirthValidator = require('../validators/directorDateOfBirth.validator')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const CompanyLookupService = require('../services/companyLookup.service')
const Account = require('../models/account.model')

module.exports = class DirectorDateOfBirthController extends BaseController {
  async doGet(request, reply, errors) {
    // Refactor this common logic
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)

    let account = await Account.getByApplicationId(authToken, applicationId)
    if (!account) {
      // TODO apply this when the account has been created in Dynamics by the previous screen
      LoggingService.logError(`Application ${applicationId} does not have an Account`, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }

    const directors = await this._getDirectors(account.companyNumber)

    const directorDateOfBirthValidator = new DirectorDateOfBirthValidator()
    directorDateOfBirthValidator.setErrorMessages(directors)


    const pageContext = this.createPageContext(errors, directorDateOfBirthValidator)

    pageContext.directors = directors

    if (directors.length > 1) {
      pageContext.pageHeading = Constants.Routes.DIRECTOR_DATE_OF_BIRTH.pageHeadingAlternate
      pageContext.pageTitle = Constants.buildPageTitle(Constants.Routes.DIRECTOR_DATE_OF_BIRTH.pageHeadingAlternate)
      // TODO change page title if there is an error using the following
      // if (errors && errors.data.details) {
      //   pageContext.pageTitle = `${Constants.PAGE_TITLE_ERROR_PREFIX} ${pageContext.pageTitle}`
      // }
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

  async doPost(request, reply, errors) {
    // Refactor this common logic
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)

    let account = await Account.getByApplicationId(authToken, applicationId)
    if (!account) {
      // TODO apply this when the account has been created in Dynamics by the previous screen
      LoggingService.logError(`Application ${applicationId} does not have an Account`, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }

    const directors = await this._getDirectors(account.companyNumber)

    // Perform manual (non-Joi) validation of dynamic form content
    errors = await this._validateDynamicFormContent(request, directors)

    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      // TODO save DOBs to Dynamics

      // console.log(request.payload)

      // await SiteNameAndLocation.saveSiteName(request, request.payload['site-name'],
      //   authToken, applicationId, applicationLineId)

      return reply.redirect(Constants.Routes.COMPANY_DECLARE_OFFENCES.path)
    }
  }

  async _getDirectors(companyNumber) {
    // TODO get this from Dynamics instead
    return await CompanyLookupService.getDirectors(companyNumber)
  }

  async _validateDynamicFormContent(request, directors) {
    let errors

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

      for (let i = 0; i < directors.length; i++) {
        let director = directors[i]
        let dobDay = request.payload[`director-dob-day-${i}`]

        if (dobDay === undefined) {
          errors.data.details.push({
            message: `"director-dob-day-${i}" is required`,
            path: `director-dob-day-${i}`,
            type: 'any.required',
            context: { key: `director-dob-day-${i}`, label: `director-dob-day-${i}` }
          })
        } else {
          let daysInBirthMonth = moment(`${director.dob.year}-${director.dob.month}`, 'YYYY-MM').daysInMonth()

          dobDay = parseInt(dobDay)
          if (isNaN(dobDay) || dobDay < 1 || dobDay > daysInBirthMonth) {
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
