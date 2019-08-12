const BaseCheck = require('./base.check')

const { EMISSIONS_MANAGEMENT_PLAN } = require('../../tasks').tasks
const { EMISSIONS_MANAGEMENT_PLAN: { path } } = require('../../routes')

module.exports = class EmissionsManagementPlanCheck extends BaseCheck {
  static get task () {
    return EMISSIONS_MANAGEMENT_PLAN
  }

  get prefix () {
    return `${super.prefix}-emissions-management-plan`
  }

  async buildLines () {
    return Promise.all([this.getEmissionsManagementPlanLine()])
  }

  async getEmissionsManagementPlanLine () {
    const evidence = await this.getEmissionsManagementPlan()
    const answers = evidence.map((file) => file.filename)
    return this.buildLine({
      heading: 'Emissions management plan',
      answers,
      links: [
        { path, type: 'emissions management plan' }
      ]
    })
  }
}
