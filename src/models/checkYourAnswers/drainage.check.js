const Constants = require('../../constants')
const BaseCheck = require('./base.check')

const {SURFACE_DRAINAGE: ruleSetId} = Constants.Dynamics.RulesetIds
const path = Constants.Routes.DRAINAGE_TYPE_DRAIN.path
const DrainageTypes = Constants.Dynamics.DrainageTypes

module.exports = class DrainageCheck extends BaseCheck {
  static get rulesetId () {
    return ruleSetId
  }

  get prefix () {
    return `${super.prefix}-drainage`
  }

  async buildLines () {
    return [await this.getDrainageLine()]
  }

  async getDrainageLine () {
    const {drainageType: type = ''} = await this.getApplication()

    const drainageType = Object.keys(DrainageTypes)
      .filter((key) => DrainageTypes[key].type === type)
      .map((key) => DrainageTypes[key])
      .pop()

    const description = drainageType && drainageType.description ? drainageType.description.toLowerCase() : 'unknown'

    return this.buildLine({
      heading: 'Vehicle storage area drainage',
      answers: [`Drains to ${description}`],
      links: [{path, type: 'drainage system'}]
    })
  }
}