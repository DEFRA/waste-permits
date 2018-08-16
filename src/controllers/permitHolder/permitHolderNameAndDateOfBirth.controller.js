'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

const Contact = require('../../models/contact.model')
const AddressDetail = require('../../models/addressDetail.model')

const {SOLE_TRADER} = require('../../dynamics').PERMIT_HOLDER_TYPES
const {PERMIT_HOLDER_CONTACT_DETAILS, PERMIT_HOLDER_TRADING_NAME} = require('../../routes')

module.exports = class PermitHolderNameAndDateOfBirthController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)
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
      const individualPermitHolderId = application.individualPermitHolderId()
      if (individualPermitHolderId) {
        contact = await Contact.getById(context, individualPermitHolderId)
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
}
