const BaseCheck = require('./base.check')
const { UploadSubject } = require('../../constants')

const { MANAGE_HAZARDOUS_WASTE } = require('../../tasks').tasks
const { HAZARDOUS_WASTE_TREATMENT_SUMMARY_UPLOAD: { path: summaryPath }, HAZARDOUS_WASTE_PLANS_UPLOAD: { path: plansPath } } = require('../../routes')

module.exports = class ManageHazardousWasteCheck extends BaseCheck {
  static get task () {
    return MANAGE_HAZARDOUS_WASTE
  }

  get prefix () {
    return `${super.prefix}-manage-hazardous-waste`
  }

  async buildLines () {
    return Promise.all([this.getSummaryLine(), this.getPlansLine()])
  }

  async getSummaryLine () {
    const evidence = await this.getUploadedFileDetails(UploadSubject.HAZARDOUS_WASTE_TREATMENT_SUMMARY, 'hazWasteTreatmentSummary')
    return this.buildLine({
      prefix: 'treatment',
      heading: 'Summary of how you’ll treat hazardous waste',
      answers: evidence.map((file) => file.filename),
      links: [
        { path: summaryPath, type: 'summary of how you’ll treat hazardous waste' }
      ]
    })
  }

  async getPlansLine () {
    const evidence = await this.getUploadedFileDetails(UploadSubject.HAZARDOUS_WASTE_PLANS, 'hazWastePlans')
    return this.buildLine({
      prefix: 'plans',
      heading: 'Hazardous waste layout plans and process flows',
      answers: evidence.map((file) => file.filename),
      links: [
        { path: plansPath, type: 'hazardous waste layout plans and process flows' }
      ]
    })
  }
}
