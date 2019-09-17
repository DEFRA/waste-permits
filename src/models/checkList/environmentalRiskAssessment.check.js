const BaseCheck = require('./base.check')
const { UploadSubject } = require('../../constants')

const { ENVIRONMENTAL_RISK_ASSESSMENT } = require('../../tasks').tasks
const { ENVIRONMENTAL_RISK_ASSESSMENT: { path } } = require('../../routes')

module.exports = class EnvironmentalRiskAssessmentCheck extends BaseCheck {
  static get task () {
    return ENVIRONMENTAL_RISK_ASSESSMENT
  }

  get prefix () {
    return `${super.prefix}-environmental-risk-assessment`
  }

  async buildLines () {
    return Promise.all([this.getEnvironmentalRiskAssessmentLine()])
  }

  async getEnvironmentalRiskAssessmentLine () {
    const evidence = await this.getUploadedFileDetails(UploadSubject.ENVIRONMENTAL_RISK_ASSESSMENT, 'environmentalRiskAssessment')
    return this.buildLine({
      heading: 'Environmental risk assessment',
      answers: evidence.map((file) => file.filename),
      links: [
        { path, type: 'environmental risk assessment' }
      ]
    })
  }
}
