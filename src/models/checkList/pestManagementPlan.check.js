const BaseCheck = require('./base.check')
const { UploadSubject } = require('../../constants')

const { PEST_MANAGEMENT_PLAN } = require('../../tasks').tasks
const { PEST_MANAGEMENT_PLAN: { path } } = require('../../routes')

module.exports = class PestManagementPlanCheck extends BaseCheck {
  static get task () {
    return PEST_MANAGEMENT_PLAN
  }

  get prefix () {
    return `${super.prefix}-pest-management-plan`
  }

  async buildLines () {
    return Promise.all([this.getPestManagementPlanLine()])
  }

  async getPestManagementPlanLine () {
    const evidence = await this.getUploadedFileDetails(UploadSubject.PEST_MANAGEMENT_PLAN, 'pestManagementPlan')
    return this.buildLine({
      heading: 'Pest management plan',
      answers: evidence.map((file) => file.filename),
      links: [
        { path, type: 'pest management plan' }
      ]
    })
  }
}
