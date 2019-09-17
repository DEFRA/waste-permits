const BaseCheck = require('./base.check')
const { UploadSubject } = require('../../constants')

const { NON_TECHNICAL_SUMMARY } = require('../../tasks').tasks
const { NON_TECHNICAL_SUMMARY: { path } } = require('../../routes')

module.exports = class NonTechnicalSummaryCheck extends BaseCheck {
  static get task () {
    return NON_TECHNICAL_SUMMARY
  }

  get prefix () {
    return `${super.prefix}-non-technical-summary`
  }

  async buildLines () {
    return Promise.all([this.getNonTechnicalSummaryLine()])
  }

  async getNonTechnicalSummaryLine () {
    const evidence = await this.getUploadedFileDetails(UploadSubject.NON_TECHNICAL_SUMMARY, 'nonTechnicalSummary')
    return this.buildLine({
      heading: 'Non-technical summary',
      answers: evidence.map((file) => file.filename),
      links: [
        { path, type: 'non-technical summary' }
      ]
    })
  }
}
