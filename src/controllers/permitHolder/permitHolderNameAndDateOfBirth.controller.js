'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

const ContactDetail = require('../../models/contactDetail.model')

const Constants = require('../../constants')
const { AddressTypes, PERMIT_HOLDER_TYPES } = require('../../dynamics')
const { INDIVIDUAL_PERMIT_HOLDER } = AddressTypes
const { SOLE_TRADER } = PERMIT_HOLDER_TYPES

module.exports = class PermitHolderNameAndDateOfBirthController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h)
    const { charityDetail } = context

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const type = INDIVIDUAL_PERMIT_HOLDER.TYPE
      const contactDetail = await ContactDetail.get(context, { type })
      if (contactDetail) {
        const { firstName = '', lastName = '', dateOfBirth = '---' } = contactDetail
        const [year, month, day] = dateOfBirth.split('-')
        pageContext.formValues = {
          'first-name': firstName,
          'last-name': lastName,
          'dob-day': day,
          'dob-month': month,
          'dob-year': year
        }
      }
    }

    if (charityDetail && charityDetail.charityPermitHolder) {
      pageContext.pageHeading = this.route.pageHeadingAlternate
      pageContext.pageTitle = Constants.buildPageTitle(this.route.pageHeadingAlternate)
      pageContext.isCharity = true
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h, { application: true })
    const { applicationId, permitHolderType } = context
    const {
      'first-name': firstName,
      'last-name': lastName,
      'dob-day': dobDay,
      'dob-month': dobMonth,
      'dob-year': dobYear
    } = request.payload

    const dateOfBirth = [dobYear, dobMonth, dobDay].join('-')

    const type = INDIVIDUAL_PERMIT_HOLDER.TYPE
    const contactDetail = (await ContactDetail.get(context, { type })) || new ContactDetail({ applicationId, type })

    Object.assign(contactDetail, { firstName, lastName, dateOfBirth })
    await contactDetail.save(context)

    const route = permitHolderType === SOLE_TRADER ? this.route.companyRoute : this.route.nextRoute

    return this.redirect({ h, route })
  }
}
