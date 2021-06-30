const BaseCheck = require('./base.check')
const { UploadSubject } = require('../../constants')

const { ApplicationQuestions: { MANAGEMENT_SYSTEM: { answers: possibleAnswers } } } = require('../../dynamics')

const { MANAGEMENT_SYSTEM } = require('../../tasks').tasks
const { route: { path } } = MANAGEMENT_SYSTEM

module.exports = class ManagementSystemCheck extends BaseCheck {
  static get task () {
    return MANAGEMENT_SYSTEM
  }

  get prefix () {
    return `${super.prefix}-management-system`
  }

  async buildLines () {
    return Promise.all([this.getManagementSystemLine()])
  }

  async getManagementSystemLine () {
    const { answerCode } = await this.getManagementSystem()
    const foundAnswer = possibleAnswers.find(({ id }) => id === answerCode)
    const answerText = foundAnswer && (foundAnswer.plainText || foundAnswer.description)

    const evidence = await this.getUploadedFileDetails(UploadSubject.MANAGEMENT_SYSTEM_SUMMARY, 'managementSystemSummary')
    const files = evidence.map(({ filename }) => filename)
    const answers = [answerText, 'Summary:', ...files]
    return this.buildLine({
      heading: 'Management system',
      answers,
      links: [
        { path, type: 'management system summary' }
      ]
    })
  }
}
