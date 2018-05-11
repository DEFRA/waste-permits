'use strict'

const moment = require('moment')

const Constants = require('../constants')
const BaseController = require('./base.controller')

module.exports = class PermitHolderNameAndDateOfBirthController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    
    if (request.payload) {
        pageContext.formValues = request.payload
    }

    return this.showView({request, h, pageContext})
  }

  async doPost (request, h, errors) {

    // Perform manual (non-Joi) validation of date of birth
    var dobError = await this._validateDateOfBirth(request)
    if (dobError) {
      errors.details.push(dobError)
    }

    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      // TODO: Save details

      return this.redirect({request, h, redirectPath: Constants.Routes.COMPANY_DECLARE_OFFENCES.path})
    }
  }
  
  // This is required because the date of birth is split across three fields
  async _validateDateOfBirth (request) {
    const dobDayFieldId = 'dob-day'
    const dobMonthFieldId = 'dob-month'
    const dobYearFieldId = 'dob-year'

    const dobDay = request.payload[dobDayFieldId]
    const dobMonth = request.payload[dobMonthFieldId]
    const dobYear = request.payload[dobYearFieldId]

    const date = moment({
      day: dobDay,
      month: parseInt(dobMonth) - 1, // Because moment 0 indexes months
      year: dobYear
    })

    if (dobDay && dobMonth && dobYear && date.isValid()) {
      return null
    } else {
      const errorPath = 'dob-day'
      
      return {
        message: 'Enter a valid date',
        path: [errorPath],
        type: 'invalid',
        context: { key: errorPath, label: errorPath }
      }
    }
  }
}