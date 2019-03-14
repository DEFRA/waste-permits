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
      this.getIsInAqmaLine(),
      this.getAqmaNameLine(),
      this.getNitrogenDioxideLevelLine(),
      this.getLocalAuthorityNameLine()
    ])
  }

  async getIsInAqmaLine () {
    const answers = []
    const aqma = await this.getAirQualityManagementArea()

    if (aqma.isInAqma) {
      answers.push('You are in an AQMA')
    } else {
      answers.push('You are not in an AQMA')
    }

    return this.buildLine({
      heading: 'Is in AQMA',
      answers,
      links: [
        { path, type: 'AQMA' }
      ]
    })
  }

  async getAqmaNameLine () {
    const aqma = await this.getAirQualityManagementArea()

    if (aqma.isInAqma) {
      return this.buildLine({
        heading: 'Name of AQMA',
        answers: [aqma.aqmaName],
        links: [
          { path, type: 'AQMA name' }
        ]
      })
    }
  }

  async getNitrogenDioxideLevelLine () {
    const aqma = await this.getAirQualityManagementArea()

    if (aqma.isInAqma) {
      return this.buildLine({
        heading: 'Background level of nitrogen dioxide',
        answers: [aqma.aqmaNitrogenDioxideLevel],
        links: [
          { path, type: 'AQMA nitrogen dioxide level' }
        ]
      })
    }
  }

  async getLocalAuthorityNameLine () {
    const aqma = await this.getAirQualityManagementArea()

    if (aqma.isInAqma) {
      return this.buildLine({
        heading: 'Name of AQMA local authority',
        answers: [aqma.aqmaLocalAuthorityName],
        links: [
          { path, type: 'AQMA local authority name' }
        ]
      })
    }
  }
}
