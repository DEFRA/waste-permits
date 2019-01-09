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
    const pageContext = this.createPageContext(h, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {}
      const context = await RecoveryService.createApplicationContext(h)

      const contactDetails = await ContactDetail.list(context, { type: PARTNER_CONTACT_DETAILS.TYPE })
      const contactDetail = await PartnerDetails.getContactDetail(request)

      if (!contactDetail) {
        return this.redirect({ h, route: TECHNICAL_PROBLEM })
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

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
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
      return this.redirect({ h, route: TECHNICAL_PROBLEM })
    }

    contactDetail.firstName = firstName
    contactDetail.lastName = lastName
    contactDetail.dateOfBirth = dateOfBirth

    await contactDetail.save(context)

    return this.redirect({ h, path: `${this.nextPath}/${request.params.partnerId}` })
  }
}
