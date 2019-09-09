const BaseCheck = require('./base.check')

const { SCREENING_TOOL } = require('../../tasks').tasks
const { SCREENING_TOOL: { path } } = require('../../routes')
const Constants = require('../../constants')

const { AIR_DISPERSION_MODELLING_REPORT } = Constants.UploadSubject

module.exports = class ScreeningToolCheck extends BaseCheck {
  static get task () {
    return SCREENING_TOOL
  }

  get prefix () {
    return `${super.prefix}-screening-tool`
  }

  async buildLines () {
    return Promise.all([this.getScreeningToolLine()])
  }

  async getScreeningToolLine () {
    const evidence = await this.getUploadedFileDetails(AIR_DISPERSION_MODELLING_REPORT, 'screeningTool')
    const answers = evidence.map((file) => file.filename)
    return this.buildLine({
      heading: 'Screening tool',
      answers,
      links: [
        { path, type: 'screening tool' }
      ]
    })
  }
}
