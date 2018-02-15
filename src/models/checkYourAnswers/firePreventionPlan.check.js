const Constants = require('../../constants')
const BaseCheck = require('./base.check')

const {FIRE_PREVENTION_PLAN: ruleSetId} = Constants.Dynamics.RulesetIds
const {FIRE_PREVENTION_PLAN} = Constants.Routes

module.exports = class FirePreventionPlanCheck extends BaseCheck {
  static get rulesetId () {
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
        {path: FIRE_PREVENTION_PLAN.path, type: 'fire prevention plan'}
      ]
    })
  }
}
