'use strict'

const { RECOVERY_FAILED, TASK_LIST } = require('../../routes')
const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

module.exports = class RecoverController extends BaseController {
  async doGet (request, h) {
    const recoveredApplication = await RecoveryService.createApplicationContext(h, { application: true, applicationReturn: true })
    if (!recoveredApplication) {
      return this.redirect({ request, h, redirectPath: RECOVERY_FAILED.path })
    }
    const { application, applicationReturn, standardRule } = recoveredApplication
    const applicationNumber = application.applicationNumber
    const { id: standardRuleId, standardRuleTypeId, code, permitName } = standardRule || {}
    const slug = applicationReturn.slug
    const pageContext = this.createPageContext(request)
    pageContext.formAction = request.path
    Object.assign(pageContext, { slug, applicationNumber, standardRuleId, standardRuleTypeId, code, permitName })
    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { cookie } = context

    // Todo: Remove once contact conversion has been completed in the CRM
    await this.recover(context)

    // Now redirect to the tasklist
    return this.redirect({ request, h, redirectPath: TASK_LIST.path, cookie })
  }

  // Todo: Remove once contact conversion has been completed in the CRM
  async recover (context) {
    const ContactDetail = require('../../models/contactDetail.model')
    const ApplicationContact = require('../../persistence/entities/applicationContact.entity')
    const Contact = require('../../persistence/entities/contact.entity')
    const {
      AddressTypes: { PARTNER_CONTACT_DETAILS },
      PERMIT_HOLDER_TYPES: { PARTNERSHIP }
    } = require('../../dynamics')

    const { applicationId, permitHolderType } = context
    if (permitHolderType === PARTNERSHIP) {
      const applicationContacts = await ApplicationContact.listByApplicationId(context, applicationId)
      const contactDetails = await ContactDetail.list(context, { type: PARTNER_CONTACT_DETAILS.TYPE })
      if (applicationContacts.length) {
        await Promise.all(applicationContacts.map(async (applicationContact) => {
          const { contactId, directorDob } = applicationContact
          const { firstName, lastName } = await Contact.getById(context, contactId)
          const contactDetail = contactDetails.find(({ customerId }) => customerId === contactId)
          if (contactDetail) {
            // Only update the missing data
            if (!contactDetail.firstName) contactDetail.firstName = firstName
            if (!contactDetail.lastName) contactDetail.lastName = lastName
            if (!contactDetail.dateOfBirth) contactDetail.dateOfBirth = directorDob
            if (!contactDetail.organisationType) contactDetail.organisationType = permitHolderType.dynamicsOrganisationTypeId
            if (!contactDetail.applicationId) contactDetail.applicationId = applicationId
            await contactDetail.save(context)
            return applicationContact.delete(context)
          }
        }))
      }
    }
  }
}
