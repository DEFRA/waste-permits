const BaseCheck = require('./base.check')

const { ENVIRONMENTAL_RISK_ASSESSMENT: { path } } = require('../../routes')

module.exports = class EnvironmentalRiskAssessmentCheck extends BaseCheck {
  get prefix () {
    return `${super.prefix}-environmental-risk-assessment`
  }

  async buildLines () {
    return Promise.all([this.getEnvironmentalRiskAssessmentLine()])
  }

  async getEnvironmentalRiskAssessmentLine () {
    const evidence = await this.getEnvironmentalRiskAssessment()
    return this.buildLine({
      heading: 'Environmental risk assessment',
      answers: evidence.map((file) => file.filename),
      links: [
        { path, type: 'environmental risk assessment' }
      ]
    })
  }
}
