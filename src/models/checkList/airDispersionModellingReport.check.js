const BaseCheck = require('./base.check')

const { AIR_DISPERSION_MODELLING_REPORT } = require('../../tasks').tasks
const { AIR_DISPERSION_MODELLING_REPORT: { path } } = require('../../routes')

module.exports = class AirDispersionModellingReportCheck extends BaseCheck {
  static get task () {
    return AIR_DISPERSION_MODELLING_REPORT
  }

  get prefix () {
    return `${super.prefix}-air-dispersion-modelling-report`
  }

  async buildLines () {
    return Promise.all([this.getAirDispersionModellingReportLine()])
  }

  async getAirDispersionModellingReportLine () {
    const evidence = await this.getAirDispersionModellingReport()
    const answers = evidence.map((file) => file.filename)
    return this.buildLine({
      heading: 'Air dispersion modelling report',
      answers,
      links: [
        { path, type: 'air dispersion modelling report' }
      ]
    })
  }
}
