const BaseCheck = require('./base.check')
const { UploadSubject } = require('../../constants')

const { ODOUR_MANAGEMENT_PLAN } = require('../../tasks').tasks
const { ODOUR_MANAGEMENT_PLAN: { path } } = require('../../routes')

module.exports = class OdourManagementPlanCheck extends BaseCheck {
  static get task () {
    return ODOUR_MANAGEMENT_PLAN
  }

  get prefix () {
    return `${super.prefix}-odour-management-plan`
  }

  async buildLines () {
    return Promise.all([this.getOdourManagementPlanLine()])
  }

  async getOdourManagementPlanLine () {
    const evidence = await this.getUploadedFileDetails(UploadSubject.ODOUR_MANAGEMENT_PLAN, 'odourManagementPlan')
    return this.buildLine({
      heading: 'Odour management plan',
      answers: evidence.map((file) => file.filename),
      links: [
        { path, type: 'odour management plan' }
      ]
    })
  }
}
