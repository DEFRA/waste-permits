const BaseCheck = require('./base.check')

const { ENERGY_EFFICIENCY_REPORT } = require('../../tasks').tasks
const { ENERGY_EFFICIENCY_REPORT: { path } } = require('../../routes')

module.exports = class EnergyEfficiencyReportCheck extends BaseCheck {
  static get task () {
    return ENERGY_EFFICIENCY_REPORT
  }

  get prefix () {
    return `${super.prefix}-energy-efficiency-report`
  }

  async buildLines () {
    return Promise.all([this.getEnergyEfficiencyReportLine()])
  }

  async getEnergyEfficiencyReportLine () {
    const evidence = await this.getEnergyEfficiencyReport()
    const answers = evidence.map((file) => file.filename)
    return this.buildLine({
      heading: 'Energy efficiency report',
      answers,
      links: [
        { path, type: 'energy efficiency report' }
      ]
    })
  }
}
