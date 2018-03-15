const Constants = require('../../constants')
const BaseCheck = require('./base.check')

const {path} = Constants.Routes.PERMIT_CATEGORY

module.exports = class PermitCheck extends BaseCheck {
  get prefix () {
    return `${super.prefix}-permit`
  }

  async buildLines () {
    return [await this.getPermitLine()]
  }

  async getPermitLine () {
    const {code = '', permitName = ''} = await this.getStandardRule()
    return this.buildLine({
      heading: 'Permit',
      answers: [`${permitName} ${code}`],
      links: [{path, type: 'contact details'}]
    })
  }
}
