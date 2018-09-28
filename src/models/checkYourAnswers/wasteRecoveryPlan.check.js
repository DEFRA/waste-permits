const BaseCheck = require('./base.check')

const { WASTE_RECOVERY_PLAN: ruleSetId } = require('../taskList/taskList.model').RuleSetIds
const { WASTE_RECOVERY_PLAN_APPROVAL } = require('../../routes')
const { RecoveryPlanAssessmentStatus } = require('../../dynamics')

module.exports = class WasteRecoveryPlanCheck extends BaseCheck {
  static get ruleSetId () {
    return ruleSetId
  }

  get prefix () {
    return `${super.prefix}-waste-recovery-plan`
  }

  async buildLines () {
    return Promise.all([this.getWasteRecoveryPlanLine()])
  }

  async getWasteRecoveryPlanLine () {
    const evidence = await this.getWasteRecoveryPlan()
    const { recoveryPlanAssessmentStatus } = await this.getApplication()
    const answers = evidence.map((file) => file.filename)
    const assessment = Object.entries(RecoveryPlanAssessmentStatus)
      .map(([status, assessment]) => assessment)
      .find(({ TYPE }) => TYPE === recoveryPlanAssessmentStatus)
    if (assessment) {
      answers.push('Assessment:')
      answers.push(assessment.DESCRIPTION)
    }
    return this.buildLine({
      heading: 'Waste recovery plan',
      answers,
      links: [
        { path: WASTE_RECOVERY_PLAN_APPROVAL.path, type: 'waste recovery plan' }
      ]
    })
  }
}
