const BaseCheck = require('./base.check')

const { BEST_AVAILABLE_TECHNIQUES_ASSESSMENT } = require('../../tasks').tasks
const { BEST_AVAILABLE_TECHNIQUES_ASSESSMENT: { path } } = require('../../routes')

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
    const evidence = await this.getBestAvailableTechniquesAssessment()
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
