const BaseCheck = require('./base.check')

const { SITE_NAME_LOCATION } = require('../../tasks').tasks
const { SITE_NAME, SITE_GRID_REFERENCE, POSTCODE_SITE, MANUAL_SITE } = require('../../routes')

module.exports = class SiteCheck extends BaseCheck {
  static get task () {
    return SITE_NAME_LOCATION
  }

  get prefix () {
    return `${super.prefix}-site`
  }

  async buildLines () {
    return Promise.all([
      this.getSiteNameLine(),
      this.getGridReferenceLine(),
      this.getSiteAddressLine()
    ])
  }

  async getSiteNameLine () {
    const { path } = SITE_NAME
    const { siteName = '' } = await this.getLocation()
    return this.buildLine({
      heading: 'Site name',
      prefix: 'name',
      answers: [siteName],
      links: [{ path, type: 'site name' }]
    })
  }

  async getGridReferenceLine () {
    const { path } = SITE_GRID_REFERENCE
    const { gridReference = '' } = await this.getLocationDetail()
    return this.buildLine({
      heading: 'Grid reference',
      prefix: 'grid-reference',
      answers: [gridReference],
      links: [{ path, type: 'grid reference' }]
    })
  }

  async getSiteAddressLine () {
    const {
      fromAddressLookup = true,
      buildingNameOrNumber = '',
      addressLine1 = '',
      addressLine2 = '',
      townOrCity = '',
      postcode = ''
    } = await this.getLocationAddress()
    let firstLine = buildingNameOrNumber
    if (firstLine && addressLine1) {
      firstLine += ', '
    }
    firstLine += addressLine1
    const { path } = fromAddressLookup ? POSTCODE_SITE : MANUAL_SITE
    return this.buildLine({
      heading: 'Site address',
      prefix: 'address',
      answers: [firstLine, addressLine2, townOrCity, postcode],
      links: [{ path, type: 'site address' }]
    })
  }
}
