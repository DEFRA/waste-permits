const BaseCheck = require('./base.check')
const { UploadSubject } = require('../../constants')

const { FIRE_PREVENTION_PLAN } = require('../../tasks').tasks
const { FIRE_PREVENTION_PLAN: { path } } = require('../../routes')

module.exports = class FirePreventionPlanCheck extends BaseCheck {
  static get task () {
    return FIRE_PREVENTION_PLAN
  }

  get prefix () {
    return `${super.prefix}-fire-prevention-plan`
  }

  async buildLines () {
    return Promise.all([this.getFirePreventionPlanLine()])
  }

  async getFirePreventionPlanLine () {
    const evidence = await this.getUploadedFileDetails(UploadSubject.FIRE_PREVENTION_PLAN, 'firePreventionPlan')
    return this.buildLine({
      heading: 'Fire prevention plan',
      answers: evidence.map((file) => file.filename),
      links: [
        { path, type: 'fire prevention plan' }
      ]
    })
  }
}
