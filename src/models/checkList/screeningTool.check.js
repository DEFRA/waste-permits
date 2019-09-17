const BaseCheck = require('./base.check')
const { UploadSubject } = require('../../constants')

const { SCREENING_TOOL } = require('../../tasks').tasks
const { SCREENING_TOOL: { path } } = require('../../routes')

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
    const evidence = await this.getUploadedFileDetails(UploadSubject.SCREENING_TOOL, 'screeningTool')
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
