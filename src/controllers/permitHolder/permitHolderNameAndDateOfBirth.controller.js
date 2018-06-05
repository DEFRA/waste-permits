'use strict'

const moment = require('moment')

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

const Contact = require('../../models/contact.model')
const AddressDetail = require('../../models/addressDetail.model')

const {
  PERMIT_HOLDER_TYPES: {SOLE_TRADER},
  Routes: {PERMIT_HOLDER_CONTACT_DETAILS, PERMIT_HOLDER_TRADING_NAME}
} = require('../../constants')

module.exports = class PermitHolderNameAndDateOfBirthController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const context = await RecoveryService.createApplicationContext(h, { application: true, individualPermitHolder: true })
    const { application, individualPermitHolder = new Contact() } = context

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      if (individualPermitHolder) {
        pageContext.formValues = {
          'first-name': individualPermitHolder.firstName,
          'last-name': individualPermitHolder.lastName
        }

        const individualPermitHolderDetails = await AddressDetail.getIndividualPermitHolderDetails(context, application.id)

        if (individualPermitHolderDetails.dateOfBirth) {
          const [year, month, day] = individualPermitHolderDetails.dateOfBirth.split('-')
          pageContext.formValues['dob-day'] = day
          pageContext.formValues['dob-month'] = month
          pageContext.formValues['dob-year'] = year
        }
      }
    }

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    // Perform manual (non-Joi) validation of date of birth
    const dobError = await this._validateDateOfBirth(request)
    if (dobError) {
      if (!errors) {
        errors = { details: [] }
      }
      errors.details.push(dobError)
    }

    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const context = await RecoveryService.createApplicationContext(h, { application: true })
      const { application, permitHolderType } = context
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
        contact = await Contact.getIndividualPermitHolderByApplicationId(context, application.id)
        if (contact.firstName !== firstName || contact.lastName !== lastName) {
          contact = undefined
        }
      }

      if (!contact) {
        contact = new Contact({ firstName, lastName })
      }

      await contact.save(context)

      application.permitHolderIndividualId = contact.id

      await application.save(context)

      const individualPermitHolderDetails = await AddressDetail.getIndividualPermitHolderDetails(context, application.id)
      individualPermitHolderDetails.dateOfBirth = `${dobYear}-${dobMonth}-${dobDay}`
      await individualPermitHolderDetails.save(context)

      const redirectPath = permitHolderType === SOLE_TRADER ? PERMIT_HOLDER_TRADING_NAME.path : PERMIT_HOLDER_CONTACT_DETAILS.path

      return this.redirect({ request, h, redirectPath })
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
