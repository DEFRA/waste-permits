const BaseCheck = require('./base.check')

const { AIR_QUALITY_MODELLING_REPORT } = require('../../tasks').tasks
const { AIR_QUALITY_MODELLING_REPORT: { path } } = require('../../routes')

module.exports = class AirQualityModellingReportCheck extends BaseCheck {
  static get task () {
    return AIR_QUALITY_MODELLING_REPORT
  }

  get prefix () {
    return `${super.prefix}-air-quality-modelling-report`
  }

  async buildLines () {
    return Promise.all([this.getAirQualityModellingReportLine()])
  }

  async getAirQualityModellingReportLine () {
    const evidence = await this.getAirQualityModellingReport()
    const answers = evidence.map((file) => file.filename)
    return this.buildLine({
      heading: 'Air quality modelling report',
      answers,
      links: [
        { path, type: 'air quality modelling report' }
      ]
    })
  }
}
