const Dynamics = require('../../dynamics')
const BaseCheck = require('./base.check')

const { MINING_DATA } = require('../../tasks').tasks
const { CONFIRM_MINING_WASTE_PLAN, MINING_WASTE_WEIGHT } = require('../../routes')
const MiningWastePlans = Dynamics.MiningWastePlans

module.exports = class MiningWasteCheck extends BaseCheck {
  static get ruleSetId () {
    return MINING_DATA.ruleSetId
  }

  get prefix () {
    return `${super.prefix}-mining-waste`
  }

  async buildLines () {
    return Promise.all([
      this.getMiningWastePlanLine(),
      this.getMiningWasteWeightLine()
    ])
  }

  async getMiningWastePlanLine () {
    const { miningWastePlan: plan = '' } = await this.getApplication()

    const miningWastePlan = Object.keys(MiningWastePlans)
      .filter((key) => MiningWastePlans[key].type === plan)
      .map((key) => MiningWastePlans[key])
      .pop()

    const description = miningWastePlan && miningWastePlan.description ? miningWastePlan.description : 'Unknown'

    return this.buildLine({
      prefix: 'plan',
      heading: 'Mining waste plan type',
      answers: [description],
      links: [{ path: CONFIRM_MINING_WASTE_PLAN.path, type: 'type of mining waste plan' }]
    })
  }

  async getMiningWasteWeightLine () {
    const { miningWasteWeight = '' } = await this.getApplication()

    return this.buildLine({
      prefix: 'weight',
      heading: 'Estimated total weight of extractive waste',
      answers: [`${miningWasteWeight} tonnes`],
      links: [{ path: MINING_WASTE_WEIGHT.path, type: 'weight' }]
    })
  }
}
