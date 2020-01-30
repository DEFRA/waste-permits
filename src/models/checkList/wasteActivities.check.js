const BaseCheck = require('./base.check')

const { path } = require('../../routes').BESPOKE_OR_STANDARD_RULES

module.exports = class WasteActivitiesCheck extends BaseCheck {
  get prefix () {
    return `${super.prefix}-activity`
  }

  async buildLines () {
    return [await this.getWasteActivitiesLine()]
  }

  async getWasteActivitiesLine () {
    const wasteActivities = await this.getWasteActivities()

    return this.buildLine({
      heading: 'Activities',
      answers: wasteActivities.wasteActivityNames,
      links: [{ path, type: 'waste activities' }]
    })
  }
}
