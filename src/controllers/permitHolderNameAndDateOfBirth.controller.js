'use strict'

const moment = require('moment')

const Constants = require('../constants')
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')

const Contact = require('../models/contact.model')

module.exports = class PermitHolderNameAndDateOfBirthController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const { authToken, application } = await RecoveryService.createApplicationContext(h, { application: true })

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const contact = application.individualPermitHolderId() ? await Contact.getIndividualPermitHolderByApplicationId(authToken, application.id) : new Contact()
      if (contact) {
        pageContext.formValues = {
          'first-name': contact.firstName,
          'last-name': contact.lastName
        }

        if (contact.dateOfBirth) {
          const [year, month, date] = contact.dateOfBirth.split('-')
          pageContext.formValues['dob-day'] = date
          pageContext.formValues['dob-month'] = month
          pageContext.formValues['dob-year'] = year
        }
      }
    }

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    // Perform manual (non-Joi) validation of date of birth
    var dobError = await this._validateDateOfBirth(request)
    if (dobError) {
      if (!errors) {
        errors = { details: [] }
      }
      errors.details.push(dobError)
    }

    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const { authToken, application } = await RecoveryService.createApplicationContext(h, { application: true })
      const {
        'first-name': firstName,
        'last-name': lastName,
        'dob-day': dobDay,
        'dob-month': dobMonth,
        'dob-year': dobYear
      } = request.payload
      let contact

      // Get an existing contact if we have it, but use a new contact if any details have changed
      if (application.individualPermitHolderId()) {
        contact = await Contact.getIndividualPermitHolderByApplicationId(authToken, application.id)
        if (contact.firstName !== firstName || contact.lastName !== lastName) {
          contact = undefined
        }
      }

      if (!contact) {
        contact = new Contact({ firstName, lastName })
      }

      contact.dateOfBirth = `${dobYear}-${dobMonth}-${dobDay}`

      await contact.save(authToken)

      application.permitHolderIndividualId = contact.id

      await application.save(authToken)

      return this.redirect({ request, h, redirectPath: Constants.Routes.PERMIT_HOLDER_CONTACT_DETAILS.path })
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
