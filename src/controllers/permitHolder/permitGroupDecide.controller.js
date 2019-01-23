'use strict'

const { GROUP_NAME, COMPANY_NUMBER, PAGE_NOT_FOUND } = require('../../routes')
const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')
const { LIMITED_COMPANY, OTHER_ORGANISATION } = require('../../dynamics').PERMIT_HOLDER_TYPES

module.exports = class PermitGroupDecideController extends BaseController {
  async doGet (request, h) {
    const pageContext = this.createPageContext(h)

    const { decision } = request.params

    if (!decision) {
      pageContext.applyAsCompanyLink = `${this.route.basePath}/company`
      pageContext.applyAsPostHoldersLink = `${this.route.basePath}/group`

      return this.showView({ h, pageContext })
    }

    const context = await RecoveryService.createApplicationContext(h)
    const { application } = context
    let organisationType
    let route

    switch (decision) {
      case 'company':
        organisationType = LIMITED_COMPANY.dynamicsOrganisationTypeId
        route = COMPANY_NUMBER
        break
      case 'group':
        organisationType = OTHER_ORGANISATION.dynamicsOrganisationTypeId
        route = GROUP_NAME
        break
      default:
        return this.redirect({ h, route: PAGE_NOT_FOUND })
    }

    if (organisationType !== application.organisationType) {
      application.organisationType = organisationType
      await application.save(context)
    }

    // Re-direct to the company details flow
    return this.redirect({ h, route })
  }
}
