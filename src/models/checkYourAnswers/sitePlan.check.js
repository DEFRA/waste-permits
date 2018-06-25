const BaseCheck = require('./base.check')

const {SITE_PLAN: ruleSetId} = require('../../dynamics').RulesetIds
const {SITE_PLAN} = require('../../routes')

module.exports = class SitePlanCheck extends BaseCheck {
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
