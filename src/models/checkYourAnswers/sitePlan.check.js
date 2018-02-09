const Constants = require('../../constants')
const BaseCheck = require('./base.check')

const {SITE_PLAN: ruleSetId} = Constants.Dynamics.RulesetIds
const {SITE_PLAN} = Constants.Routes

module.exports = class SiteCheck extends BaseCheck {
  static get rulesetId () {
    return ruleSetId
  }

  get prefix () {
    return `${super.prefix}-site-plan`
  }

  async buildLines () {
    return Promise.all([this.getSitePlanLine()])
  }

  async getSitePlanLine () {
    const evidence = await this.getSitePlan()
    return this.buildLine({
      heading: 'Site plan',
      answers: evidence.map((file) => file.filename),
      links: [
        {path: SITE_PLAN.path, type: 'site plan'}
      ]
    })
  }
}
