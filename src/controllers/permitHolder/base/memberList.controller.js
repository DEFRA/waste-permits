'use strict'

const BaseController = require('../../base.controller')
const RecoveryService = require('../../../services/recovery.service')
const CryptoService = require('../../../services/crypto.service')
const ContactDetail = require('../../../models/contactDetail.model')
const Utilities = require('../../../utilities/utilities')
const Routes = require('../../../routes')

module.exports = class MemberListController extends BaseController {
  async createMember (context) {
    const { applicationId } = context
    // Create an empty Contact Detail
    const contactDetail = new ContactDetail({ applicationId, type: this.task.contactType })
    const contactDetailId = await contactDetail.save(context)
    return CryptoService.encrypt(contactDetailId)
  }

  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h, { account: true })
    const { addAnotherMember } = request.params
    const { deleteRoute, holderRoute } = this.route

    // Get a list of members associated with this application
    const list = await ContactDetail.list(context, { type: this.task.contactType })

    const contactDetails = await Promise.all(list.map(async (contactDetail) => {
      const { id, dateOfBirth, firstName, lastName, jobTitle, email, telephone, fullAddress } = contactDetail

      if (id && dateOfBirth) {
        const name = `${firstName} ${lastName}`
        const [year, month, day] = dateOfBirth.split('-')
        const memberId = CryptoService.encrypt(id)
        const dob = Utilities.formatDate({ year, month, day })
        if (fullAddress) {
          const changeLink = `${Routes[holderRoute].path}/${memberId}`
          const deleteLink = `${Routes[deleteRoute].path}/${memberId}`
          return { memberId, name, jobTitle, email, telephone, dob, changeLink, deleteLink, fullAddress }
        }
      }
      // Remove any incomplete members
      await contactDetail.delete(context)
      return false
    }))

    // Filter out the incomplete members
    pageContext.members = contactDetails.filter((member) => member)

    const { min, addParam, addButtonTitle, submitButtonTitle } = this.route.list

    // Redirect to adding a new member if the suffix "/add" is on the url or there are no members or there are incomplete members for this application
    if (addAnotherMember === addParam || !pageContext.members.length) {
      const memberId = await this.createMember(context)

      return this.redirect({ h, path: `${Routes[holderRoute].path}/${memberId}` })
    }

    if (pageContext.members.length < min) {
      pageContext.submitButtonTitle = addButtonTitle
    } else {
      pageContext.addAnotherMemberLink = `${this.route.basePath}/${addParam}`
      pageContext.addButtonTitle = addButtonTitle
      pageContext.submitButtonTitle = submitButtonTitle
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const { holderRoute } = this.route
    const context = await RecoveryService.createApplicationContext(h)
    const list = await ContactDetail.list(context, { type: this.task.contactType })
    if (list.length < this.route.list.min) {
      // In this case the submit button would have been labeled "Add another Member"
      const memberId = await this.createMember(context)
      return this.redirect({ h, path: `${Routes[holderRoute].path}/${memberId}` })
    }

    // In this case the submit button would have been labeled "All Members added - continue"
    // Adding another member is still possible by clicking the "Add another Member" link in the page
    return this.redirect({ h })
  }
}
