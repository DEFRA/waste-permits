const BaseCheck = require('./base.check')

const { BEST_AVAILABLE_TECHNIQUES_ASSESSMENT } = require('../../tasks').tasks
const { BEST_AVAILABLE_TECHNIQUES_ASSESSMENT: { path } } = require('../../routes')

const Constants = require('../../constants')

module.exports = class BestAvailableTechniquesAssessmentCheck extends BaseCheck {
  static get task () {
    return BEST_AVAILABLE_TECHNIQUES_ASSESSMENT
  }

  get prefix () {
    return `${super.prefix}-best-available-techniques-assessment`
  }

  async buildLines () {
    return Promise.all([this.getBestAvailableTechniquesAssessmentLine()])
  }

  async getBestAvailableTechniquesAssessmentLine () {
    const evidence = await this.getUploadedFileDetails(Constants.UploadSubject.BEST_AVAILABLE_TECHNIQUES_ASSESSMENT, 'bestAvailableTechniquesAssessment')
    const answers = evidence.map((file) => file.filename)
    return this.buildLine({
      heading: 'Best available techniques assessment',
      answers,
      links: [
        { path, type: 'best available techniques assessment' }
      ]
    })
  }
}
