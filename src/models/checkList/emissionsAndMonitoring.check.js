const BaseCheck = require('./base.check')

const { EMISSIONS_AND_MONITORING } = require('../../tasks').tasks
const { EMISSIONS_AND_MONITORING_CHECK: { path } } = require('../../routes')

module.exports = class EmissionsAndMonitoringCheck extends BaseCheck {
  static get task () {
    return EMISSIONS_AND_MONITORING
  }

  get prefix () {
    return `${super.prefix}-emissions-and-monitoring`
  }

  async buildLines () {
    return Promise.all([this.getEmissionsAndMonitoringLine()])
  }

  async getEmissionsAndMonitoringLine () {
    const evidence = await this.getEmissionsAndMonitoringDetails()
    const answers = evidence.emissionsAndMonitoringDetailsRequired ? evidence.files.map((file) => file.filename) : ['Not required']
    return this.buildLine({
      heading: 'Emissions and monitoring',
      answers,
      links: [
        { path, type: 'emissions and monitoring' }
      ]
    })
  }
}
