const BaseCheck = require('./base.check')
const { UploadSubject } = require('../../constants')

const { WASTE_RECOVERY_PLAN } = require('../../tasks').tasks
const { WASTE_RECOVERY_PLAN_APPROVAL } = require('../../routes')
const { RecoveryPlanAssessmentStatus } = require('../../dynamics')

module.exports = class WasteRecoveryPlanCheck extends BaseCheck {
  static get task () {
    return WASTE_RECOVERY_PLAN
  }

  get prefix () {
    return `${super.prefix}-waste-recovery-plan`
  }

  async buildLines () {
    return Promise.all([this.getWasteRecoveryPlanLine()])
  }

  async getWasteRecoveryPlanLine () {
    const evidence = await this.getUploadedFileDetails(UploadSubject.WASTE_RECOVERY_PLAN, 'wasteRecoveryPlan')
    const { recoveryPlanAssessmentStatus } = await this.getApplication()
    const answers = evidence.map((file) => file.filename)
    const assessment = Object.values(RecoveryPlanAssessmentStatus)
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
