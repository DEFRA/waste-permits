const BaseCheck = require('./base.check')

const { NEED_TO_CONSULT } = require('../../tasks').tasks
const { NEED_TO_CONSULT: { path } } = require('../../routes')

module.exports = class NeedToConsultCheck extends BaseCheck {
  static get task () {
    return NEED_TO_CONSULT
  }

  get prefix () {
    return `${super.prefix}-consult`
  }

  async buildLines () {
    return Promise.all([this.getNeedToConsultLines()])
  }

  async getNeedToConsultLines () {
    const answers = []

    const consult = await this.getNeedToConsult()

    if (consult.none) {
      answers.push('None')
    } else {
      if (consult.sewer && consult.sewerageUndertaker) {
        answers.push(consult.sewerageUndertaker)
      }
      if (consult.harbour && consult.harbourAuthority) {
        answers.push(consult.harbourAuthority)
      }
      if (consult.fisheries && consult.fisheriesCommittee) {
        answers.push(consult.fisheriesCommittee)
      }
    }

    return this.buildLine({
      heading: 'Organisations we need to consult',
      answers,
      links: [
        { path, type: 'organisation' }
      ]
    })
  }
}
