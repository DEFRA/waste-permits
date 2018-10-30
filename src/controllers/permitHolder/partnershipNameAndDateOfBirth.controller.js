'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

const ContactDetail = require('../../models/contactDetail.model')
const PartnerDetails = require('../../models/taskList/partnerDetails.task')

const Constants = require('../../constants')
const { PARTNER_CONTACT_DETAILS } = require('../../dynamics').AddressTypes
const { TECHNICAL_PROBLEM } = require('../../routes')

module.exports = class PartnershipNameAndDateOfBirthController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {}
      const context = await RecoveryService.createApplicationContext(h)

      const contactDetails = await ContactDetail.list(context, { type: PARTNER_CONTACT_DETAILS.TYPE })
      const contactDetail = await PartnerDetails.getContactDetail(request)

      if (!contactDetail) {
        return this.redirect({ request, h, redirectPath: TECHNICAL_PROBLEM.path })
      }

      const { firstName, lastName, dateOfBirth } = contactDetail
      if (firstName || lastName) {
        pageContext.formValues['first-name'] = firstName
        pageContext.formValues['last-name'] = lastName
        pageContext.pageHeading = this.route.pageHeadingEdit
        pageContext.pageTitle = Constants.buildPageTitle(this.route.pageHeadingEdit)
      } else if (contactDetails.length > 1) {
        pageContext.pageHeading = this.route.pageHeadingAdd
        pageContext.pageTitle = Constants.buildPageTitle(this.route.pageHeadingAdd)
      }

      if (dateOfBirth) {
        const [year, month, day] = dateOfBirth.split('-')
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
      const context = await RecoveryService.createApplicationContext(h, { application: true })
      const {
        'first-name': firstName,
        'last-name': lastName,
        'dob-day': dobDay,
        'dob-month': dobMonth,
        'dob-year': dobYear
      } = request.payload

      const dateOfBirth = [dobYear, dobMonth, dobDay].join('-')
      const contactDetail = await PartnerDetails.getContactDetail(request)

      if (!contactDetail) {
        return this.redirect({ request, h, redirectPath: TECHNICAL_PROBLEM.path })
      }

      contactDetail.firstName = firstName
      contactDetail.lastName = lastName
      contactDetail.dateOfBirth = dateOfBirth

      await contactDetail.save(context)

      return this.redirect({ request, h, redirectPath: `${this.nextPath}/${request.params.partnerId}` })
    }
  }
}
