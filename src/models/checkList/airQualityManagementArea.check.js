const BaseCheck = require('./base.check')

const { AIR_QUALITY_MANAGEMENT_AREA } = require('../../tasks').tasks
const { AIR_QUALITY_MANAGEMENT_AREA: { path } } = require('../../routes')

module.exports = class AirQualityManagementAreaCheck extends BaseCheck {
  static get task () {
    return AIR_QUALITY_MANAGEMENT_AREA
  }

  get prefix () {
    return `${super.prefix}-aqma`
  }

  async buildLines () {
    return Promise.all([
      this.getAqmaLine()
    ])
  }

  // TODO: lines subject to change so may need to revisit this

  async getAqmaLine () {
    const aqma = await this.getAirQualityManagementArea()
    const { isInAqma, name, nitrogenDioxideLevel, localAuthorityName } = aqma
    const answers = []

    if (isInAqma) {
      answers.push('You are in an AQMA, or may deploy to an AQMA')
      answers.push(`AQMA name: ${name}`)
      answers.push(`Background level of nitrogen dioxide: ${nitrogenDioxideLevel} µg/m3`)
      answers.push(`Local authority: ${localAuthorityName}`)
    } else {
      answers.push('You are not in an AQMA')
    }

    return this.buildLine({
      heading: 'Air Quality Management Area (AQMA)',
      answers,
      links: [{ path, type: 'Air Quality Management Area' }]
    })
  }
}
