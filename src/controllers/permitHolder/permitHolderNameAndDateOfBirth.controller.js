'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

const ContactDetail = require('../../models/contactDetail.model')

const { SOLE_TRADER } = require('../../dynamics').PERMIT_HOLDER_TYPES
const Routes = require('../../routes')
const { INDIVIDUAL_PERMIT_HOLDER } = require('../../dynamics').AddressTypes

module.exports = class PermitHolderNameAndDateOfBirthController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)
    const context = await RecoveryService.createApplicationContext(h)

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

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
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

      const redirectPath = permitHolderType === SOLE_TRADER ? Routes[this.route.companyRoute].path : this.nextPath

      return this.redirect({ request, h, redirectPath })
    }
  }
}
