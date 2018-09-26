const BaseCheck = require('./base.check')

const { FIRE_PREVENTION_PLAN: ruleSetId } = require('../taskList/taskList.model').RuleSetIds
const { FIRE_PREVENTION_PLAN } = require('../../routes')

module.exports = class FirePreventionPlanCheck extends BaseCheck {
  static get ruleSetId () {
    return ruleSetId
  }

  get prefix () {
    return `${super.prefix}-fire-prevention-plan`
  }

  async buildLines () {
    return Promise.all([this.getFirePreventionPlanLine()])
  }

  async getFirePreventionPlanLine () {
    const evidence = await this.getFirePreventionPlan()
    return this.buildLine({
      heading: 'Fire prevention plan',
      answers: evidence.map((file) => file.filename),
      links: [
        { path: FIRE_PREVENTION_PLAN.path, type: 'fire prevention plan' }
      ]
    })
  }
}
