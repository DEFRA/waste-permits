const BaseCheck = require('./base.check')

const { INVOICING_DETAILS } = require('../../tasks').tasks
const { POSTCODE_INVOICE, MANUAL_INVOICE, INVOICE_CONTACT } = require('../../routes')
const { BILLING_INVOICING } = require('../../dynamics').AddressTypes

module.exports = class InvoiceCheck extends BaseCheck {
  static get task () {
    return INVOICING_DETAILS
  }

  get prefix () {
    return `${super.prefix}-invoice`
  }

  async buildLines () {
    return Promise.all([
      this.getInvoiceAddressLine(),
      this.getInvoiceContactLine()
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
    const { path } = fromAddressLookup ? POSTCODE_INVOICE : MANUAL_INVOICE
    let firstLine = buildingNameOrNumber
    if (firstLine && addressLine1) {
      firstLine += ', '
    }
    firstLine += addressLine1
    return this.buildLine({
      heading: 'Invoice address',
      prefix: 'address',
      answers: [firstLine, addressLine2, townOrCity, postcode],
      links: [{ path, type: 'invoice address' }]
    })
  }

  async getInvoiceContactLine () {
    const contactDetails = await this.getContactDetails(BILLING_INVOICING)
    const { firstName = '', lastName = '', email = '', telephone = '' } = contactDetails
    return this.buildLine({
      heading: 'Invoice contact',
      prefix: 'contact',
      answers: [`${firstName} ${lastName}`, email, `Telephone: ${telephone}`],
      links: [{ path: INVOICE_CONTACT.path, type: 'invoice contact' }]
    })
  }
}
