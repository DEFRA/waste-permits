const BaseCheck = require('./base.check')
const { UploadSubject } = require('../../constants')

const { CLINICAL_WASTE_APPENDIX } = require('../../tasks').tasks

const {
  CLINICAL_WASTE_DOCUMENTS_JUSTIFICATION_UPLOAD: { path: justificationPath },
  CLINICAL_WASTE_DOCUMENTS_SUMMARY_UPLOAD: { path: summaryPath }
} = require('../../routes')

module.exports = class ClinicalWasteAppendixCheck extends BaseCheck {
  static get task () {
    return CLINICAL_WASTE_APPENDIX
  }

  get prefix () {
    return `${super.prefix}-clinical-waste-appendix`
  }

  async buildLines () {
    return Promise.all([this.getJustificationLine(), this.getTreatmentSummaryLine()])
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

  async getTreatmentSummaryLine () {
    const evidence = await this.getUploadedFileDetails(UploadSubject.CLINICAL_WASTE_TREATMENT_SUMMARY, 'clinicalWasteTreatmentSummary')
    return this.buildLine({
      prefix: 'summary',
      heading: 'Clinical waste treatment summary',
      answers: evidence.map((file) => file.filename),
      links: [
        { path: summaryPath, type: 'clinical waste treatment summary' }
      ]
    })
  }
}
