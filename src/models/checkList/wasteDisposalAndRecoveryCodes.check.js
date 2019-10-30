const BaseCheck = require('./base.check')

const { RECOVERY_AND_DISPOSAL_CODES } = require('../../tasks').tasks
const { WASTE_RD: { path } } = require('../../routes')

module.exports = class WasteDisposalAndRecoveryCodesCheck extends BaseCheck {
  static get task () {
    return RECOVERY_AND_DISPOSAL_CODES
  }

  get prefix () {
    return `${super.prefix}-waste-rd`
  }

  async buildLines () {
    return Promise.all([this.getNeedToConsultLines()])
  }

  async getNeedToConsultLines () {
    const allCodes = await this.getAllWasteDisposalAndRecoveryCodes()

    const answer = allCodes.map((codes) => codes.combinedSelectedCodesForDisplay.join(', ')).join('; ')

    return this.buildLine({
      heading: 'D and R codes',
      answers: [answer],
      links: [
        { path, type: 'disposal and recovery codes' }
      ]
    })
  }
}
