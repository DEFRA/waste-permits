const BaseCheck = require('./base.check')
const { UploadSubject } = require('../../constants')

const { CLINICAL_WASTE_APPENDIX } = require('../../tasks').tasks
const { CLINICAL_WASTE_DOCUMENTS_JUSTIFICATION_UPLOAD: { path: justificationPath } } = require('../../routes')
// const { CLINICAL_WASTE_DOCUMENTS_JUSTIFICATION_UPLOAD: { path: justificationPath }, HAZARDOUS_WASTE_PLANS_UPLOAD: { path: plansPath } } = require('../../routes')

module.exports = class ClinicalWasteAppendixCheck extends BaseCheck {
  static get task () {
    return CLINICAL_WASTE_APPENDIX
  }

  get prefix () {
    return `${super.prefix}-clinical-waste-appendix`
  }

  async buildLines () {
    return Promise.all([this.getJustificationLine()])
    // return Promise.all([this.getSummaryLine(), this.getPlansLine()])
  }

  async getJustificationLine () {
    const evidence = await this.getUploadedFileDetails(UploadSubject.CLINICAL_WASTE_JUSTIFICATION, 'clinicalWasteJustification')
    return this.buildLine({
      prefix: 'justification',
      heading: 'Justification for storing or treating a waste type not included in Section 2.1',
      answers: evidence.map((file) => file.filename),
      links: [
        { path: justificationPath, type: 'justification for storing or treating a waste type not included in Section 2.1' }
      ]
    })
  }

  // async getPlansLine () {
  //   const evidence = await this.getUploadedFileDetails(UploadSubject.HAZARDOUS_WASTE_PLANS, 'hazWastePlans')
  //   return this.buildLine({
  //     prefix: 'plans',
  //     heading: 'Hazardous waste layout plans and process flows',
  //     answers: evidence.map((file) => file.filename),
  //     links: [
  //       { path: plansPath, type: 'hazardous waste layout plans and process flows' }
  //     ]
  //   })
  // }
}
