const BaseCheck = require('./base.check')

const { WASTE_WEIGHTS } = require('../../tasks').tasks
const { WASTE_WEIGHTS: { path } } = require('../../routes')

module.exports = class WasteWeightsCheck extends BaseCheck {
  static get task () {
    return WASTE_WEIGHTS
  }

  get prefix () {
    return `${super.prefix}-waste-weights`
  }

  async buildLines () {
    return Promise.all([this.getWasteWeightLines()])
  }

  async getWasteWeightLines () {
    const allWeights = await this.getAllWasteWeights()

    const answer = allWeights.map((weights) => weights.listOfWeights.join(', ')).join('; ')

    return this.buildLine({
      heading: 'Waste storage capacity and annual throughput',
      answers: [answer],
      links: [
        { path, type: 'waste storage capacity and annual throughput' }
      ]
    })
  }
}
