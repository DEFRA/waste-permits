const BaseCheck = require('./base.check')

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
    const { answerText } = await this.getManagementSystem()
    const evidence = await this.getManagementSystemSummary()
    const files = evidence.map(({ filename }) => filename)
    let answers = [answerText, 'Summary:', ...files]
    return this.buildLine({
      heading: 'Management system',
      answers,
      links: [
        { path, type: 'management system' }
      ]
    })
  }
}
