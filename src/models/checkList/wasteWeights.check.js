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
    const allWeights = await this.getAllWasteWeights()

    const collatedWeights = allWeights.reduce((acc, { hasHazardousWaste, nonHazardousThroughput, nonHazardousMaximum, hazardousThroughput, hazardousMaximum }) => {
      acc.nonHazardousThroughput.push(nonHazardousThroughput)
      acc.nonHazardousMaximum.push(nonHazardousMaximum)
      if (hasHazardousWaste) {
        acc.hasHazardousWaste = true
        acc.hazardousThroughput.push(hazardousThroughput)
        acc.hazardousMaximum.push(hazardousMaximum)
      }
      return acc
    }, { hasHazardousWaste: false, nonHazardousThroughput: [], nonHazardousMaximum: [], hazardousThroughput: [], hazardousMaximum: [] })

    const lines = []
    lines.push(this.buildWasteLine(collatedWeights.nonHazardousThroughput, 'Total non-hazardous waste throughput (tonnes a year)', 'non-haz-tp'))
    lines.push(this.buildWasteLine(collatedWeights.nonHazardousMaximum, 'Total non-hazardous waste stored (tonnes)', 'non-haz-max'))
    if (collatedWeights.hasHazardousWaste) {
      lines.push(this.buildWasteLine(collatedWeights.hazardousThroughput, 'Total hazardous waste throughput (tonnes a year)', 'haz-tp'))
      lines.push(this.buildWasteLine(collatedWeights.hazardousMaximum, 'Total hazardous waste stored (tonnes)', 'haz-max'))
    }

    return lines
  }

  buildWasteLine (weights, heading, prefix) {
    return this.buildLine({
      heading,
      prefix,
      answers: [weights.join('; ')],
      links: [
        { path, type: 'waste storage capacity and annual throughput' }
      ]
    })
  }
}
