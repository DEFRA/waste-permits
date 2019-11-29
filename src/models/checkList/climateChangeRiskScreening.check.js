const BaseCheck = require('./base.check')
const { UploadSubject } = require('../../constants')

const { CLIMATE_CHANGE_RISK_SCREENING } = require('../../tasks').tasks
const { CLIMATE_CHANGE_RISK_SCREENING_NO_UPLOAD, CLIMATE_CHANGE_RISK_SCREENING_UPLOAD } = require('../../routes')

module.exports = class ClimateChangeRiskScreeningCheck extends BaseCheck {
  static get task () {
    return CLIMATE_CHANGE_RISK_SCREENING
  }

  get prefix () {
    return `${super.prefix}-climate-change-risk-screening`
  }

  async buildLines () {
    return Promise.all([
      this.getClimateChangeRiskScreeningLine()
    ])
  }

  async getClimateChangeRiskScreeningLine () {
    let answers = []
    let path

    const climateChangeRiskScreening = await this.getClimateChangeRiskScreening()
    const { isUploadRequired } = climateChangeRiskScreening

    if (isUploadRequired) {
      const annotations = await this.getUploadedFileDetails(UploadSubject.CLIMATE_CHANGE_RISK_ASSESSMENT, 'climateChangeRiskAssessment')
      answers = annotations.map((file) => file.filename)
      path = CLIMATE_CHANGE_RISK_SCREENING_UPLOAD.path
    } else {
      answers.push('No assessment required')
      path = CLIMATE_CHANGE_RISK_SCREENING_NO_UPLOAD.path
    }

    return this.buildLine({
      heading: 'Climate Change Risk Screening',
      answers,
      links: [{ path, type: 'Climate Change Risk Screening' }]
    })
  }
}
