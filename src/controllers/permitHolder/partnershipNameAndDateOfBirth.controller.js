'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

const ApplicationContact = require('../../persistence/entities/applicationContact.entity')
const Contact = require('../../persistence/entities/contact.entity')
const PartnerDetails = require('../../models/taskList/partnerDetails.task')

const Constants = require('../../constants')
const { TECHNICAL_PROBLEM } = require('../../routes')

module.exports = class PartnershipNameAndDateOfBirthController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {}
      const context = await RecoveryService.createApplicationContext(h, { application: true })
      const { applicationId } = context

      const applicationContacts = await ApplicationContact.listByApplicationId(context, applicationId)
      const applicationContact = await PartnerDetails.getApplicationContact(request)

      if (!applicationContact) {
        return this.redirect({ request, h, redirectPath: TECHNICAL_PROBLEM.path })
      }

      const { contactId, directorDob } = applicationContact
      if (contactId) {
        const { firstName, lastName } = await Contact.getById(context, contactId)
        pageContext.formValues['first-name'] = firstName
        pageContext.formValues['last-name'] = lastName
        pageContext.pageHeading = this.route.pageHeadingEdit
        pageContext.pageTitle = Constants.buildPageTitle(this.route.pageHeadingEdit)
      } else if (applicationContacts.length > 1) {
        pageContext.pageHeading = this.route.pageHeadingAdd
        pageContext.pageTitle = Constants.buildPageTitle(this.route.pageHeadingAdd)
      }

      if (directorDob) {
        const [year, month, day] = directorDob.split('-')
        pageContext.formValues['dob-day'] = day
        pageContext.formValues['dob-month'] = month
        pageContext.formValues['dob-year'] = year
      }
    }

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const context = await RecoveryService.createApplicationContext(h, { application: true, account: true })
      const {
        'first-name': firstName,
        'last-name': lastName,
        'dob-day': dobDay,
        'dob-month': dobMonth,
        'dob-year': dobYear
      } = request.payload

      const directorDob = [dobYear, dobMonth, dobDay].join('-')
      const applicationContact = await PartnerDetails.getApplicationContact(request)

      if (!applicationContact) {
        return this.redirect({ request, h, redirectPath: TECHNICAL_PROBLEM.path })
      }

      // Create a new contact if the name has changed

      let contact = await Contact.getById(context, applicationContact.contactId)
      if (contact && (contact.firstName !== firstName || contact.lastName !== lastName)) {
        contact = undefined
      }

      if (!contact) {
        contact = new Contact({ firstName, lastName })
        await contact.save(context)
        applicationContact.contactId = contact.id
      }

      applicationContact.directorDob = directorDob
      await applicationContact.save(context)

      return this.redirect({ request, h, redirectPath: `${this.nextPath}/${request.params.partnerId}` })
    }
  }
}
