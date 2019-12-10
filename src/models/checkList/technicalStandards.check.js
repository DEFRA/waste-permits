const BaseCheck = require('./base.check')
const { UploadSubject } = require('../../constants')

const { TECHNICAL_STANDARDS } = require('../../tasks').tasks
const { TECHNICAL_STANDARDS: { path } } = require('../../routes')

module.exports = class TechnicalStandardsCheck extends BaseCheck {
  static get task () {
    return TECHNICAL_STANDARDS
  }

  get prefix () {
    return `${super.prefix}-technical-standards`
  }

  async buildLines () {
    return Promise.all([this.getTechnicalStandardsLine()])
  }

  async getTechnicalStandardsLine () {
    const evidence = await this.getUploadedFileDetails(UploadSubject.TECHNICAL_STANDARDS, 'technicalStandards')
    return this.buildLine({
      heading: 'Technical standards',
      answers: evidence.map((file) => file.filename),
      links: [
        { path, type: 'list of technical standards' }
      ]
    })
  }
}
