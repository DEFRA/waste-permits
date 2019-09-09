const BaseCheck = require('./base.check')
const Constants = require('../../constants')

const { SITE_CONDITION_REPORT } = require('../../tasks').tasks
const { SITE_CONDITION_REPORT: { path } } = require('../../routes')

module.exports = class SiteConditionReportCheck extends BaseCheck {
  static get task () {
    return SITE_CONDITION_REPORT
  }

  get prefix () {
    return `${super.prefix}-site-condition-report`
  }

  async buildLines () {
    return Promise.all([this.getSiteConditionReportLine()])
  }

  async getSiteConditionReportLine () {
    const evidence = await this.getUploadedFileDetails(Constants.UploadSubject.SITE_CONDITION_REPORT, 'siteConditionReport')
    return this.buildLine({
      heading: 'Site condition report',
      answers: evidence.map((file) => file.filename),
      links: [
        { path, type: 'site condition report' }
      ]
    })
  }
}
