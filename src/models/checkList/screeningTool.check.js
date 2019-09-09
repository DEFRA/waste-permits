const BaseCheck = require('./base.check')

const { SCREENING_TOOL } = require('../../tasks').tasks
const { SCREENING_TOOL: { path } } = require('../../routes')
const Constants = require('../../constants')

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
    const evidence = await this.getUploadedFileDetails(Constants.UploadSubject.SCREENING_TOOL, 'screeningTool')
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
