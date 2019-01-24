'use strict'

const BaseController = require('../../base.controller')
const RecoveryService = require('../../../services/recovery.service')

const ContactDetail = require('../../../models/contactDetail.model')

const Constants = require('../../../constants')

module.exports = class MemberNameAndDateOfBirthController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {}
      const context = await RecoveryService.createApplicationContext(h)

      const contactDetails = await ContactDetail.list(context, { type: this.task.contactType })
      const contactDetail = await this.task.getContactDetail(request)

      if (!contactDetail) {
        throw new Error('Partner details not found')
      }

      const { firstName, lastName, jobTitle, dateOfBirth } = contactDetail
      if (firstName || lastName) {
        pageContext.formValues['first-name'] = firstName
        pageContext.formValues['last-name'] = lastName
        pageContext.formValues['job-title'] = jobTitle
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

    if (this.route.includesJobTitle) {
      pageContext.includesJobTitle = true
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const {
      'first-name': firstName,
      'last-name': lastName,
      'job-title': jobTitle,
      'dob-day': dobDay,
      'dob-month': dobMonth,
      'dob-year': dobYear
    } = request.payload

    const dateOfBirth = [dobYear, dobMonth, dobDay].join('-')
    const contactDetail = await this.task.getContactDetail(request)

    if (!contactDetail) {
      throw new Error('Member details not found')
    }

    contactDetail.firstName = firstName
    contactDetail.lastName = lastName
    if (jobTitle) {
      contactDetail.jobTitle = jobTitle
    }
    contactDetail.dateOfBirth = dateOfBirth

    await contactDetail.save(context)

    return this.redirect({ h, path: `${this.nextPath}/${request.params.partnerId}` })
  }
}
