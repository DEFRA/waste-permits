const BaseCheck = require('./base.check')

const { SITE_PLAN } = require('../../tasks').tasks
const { SITE_PLAN: { path } } = require('../../routes')

module.exports = class SitePlanCheck extends BaseCheck {
  static get ruleSetId () {
    return SITE_PLAN.ruleSetId
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
        { path, type: 'site plan' }
      ]
    })
  }
}
