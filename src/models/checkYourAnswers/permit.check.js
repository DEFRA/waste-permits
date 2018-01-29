const Constants = require('../../constants')
const BaseCheck = require('./base.check')

// Not in use for MVP
// const {path} = Constants.Routes.PERMIT_CATEGORY
const {path} = Constants.Routes.PERMIT_SELECT

module.exports = class PermitCheck extends BaseCheck {
  get prefix () {
    return `${super.prefix}-permit`
  }

  async buildLines () {
    return [await this.getPermitLine()]
  }

  async getPermitLine () {
    const {code = '', name = ''} = await this.getStandardRule()
    return this.buildLine({
      heading: 'Permit',
      answers: [`${name} ${code}`],
      links: [{path, type: 'contact details'}]
    })
  }
}
