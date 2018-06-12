const Constants = require('../../constants')
const BaseCheck = require('./base.check')

const {INVOICING_DETAILS: ruleSetId} = Constants.Dynamics.RulesetIds
const {POSTCODE_INVOICE, MANUAL_INVOICE} = Constants.Routes

module.exports = class InvoiceCheck extends BaseCheck {
  static get rulesetId () {
    return ruleSetId
  }

  get prefix () {
    return `${super.prefix}-invoice`
  }

  async buildLines () {
    return Promise.all([
      this.getInvoiceAddressLine()
    ])
  }

  async getInvoiceAddressLine () {
    const {
      fromAddressLookup = true,
      buildingNameOrNumber = '',
      addressLine1 = '',
      addressLine2 = '',
      townOrCity = '',
      postcode = ''
    } = await this.getInvoiceAddress()
    const {path} = fromAddressLookup ? POSTCODE_INVOICE : MANUAL_INVOICE
    let firstLine = buildingNameOrNumber
    if (firstLine && addressLine1) {
      firstLine += ', '
    }
    firstLine += addressLine1
    return this.buildLine({
      heading: 'Invoice address',
      prefix: 'address',
      answers: [firstLine, addressLine2, townOrCity, postcode],
      links: [{path, type: 'invoice address'}]
    })
  }
}
