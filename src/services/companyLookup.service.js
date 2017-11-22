'use strict'

const rp = require('request-promise')

const config = require('../config/config')
const Constants = require('../constants')
const COMPANY_STATUS_LIST = Object.keys(Constants.CompanyStatus)
const DEFAULT_COMPANY_STATUS = 'NOT_ACTIVE'
const ACTIVE_COMPANY_STATUS = 'ACTIVE'

module.exports = class CompanyLookupService {
  static async getCompany (companyNumber) {
    const options = {
      uri: `${config.COMPANIES_HOUSE_SERVICE}/company/${companyNumber}`,
      auth: {
        'username': config.COMPANIES_HOUSE_API_KEY,
        'password': ''
      },
      json: true
    }

    let company = {}
    await rp(options)
      .then((data) => {
        if (data) {
          const formattedCompanyStatus = CompanyLookupService._formatCompanyStatus(data.company_status)

          company.companyStatus = COMPANY_STATUS_LIST.includes(formattedCompanyStatus) ? formattedCompanyStatus : DEFAULT_COMPANY_STATUS
          company.isActive = (formattedCompanyStatus === ACTIVE_COMPANY_STATUS)
          company.name = data.company_name
          company.address = CompanyLookupService._formatAddress(data.registered_office_address)
        }
      })
      .catch((error) => {
        if (error.statusCode !== 404) {
          throw error
        }
      })

    return company
  }

  // Convert to upper case and replaces the hyphens with underscores
  static _formatCompanyStatus (companyStatus) {
    return (companyStatus || '').toUpperCase().replace(/-/g, '_')
  }
  static _formatAddress (registeredOffice) {
    let formattedAddress
    if (registeredOffice) {
      formattedAddress = `${registeredOffice.address_line_1}, ${registeredOffice.locality}, ${registeredOffice.region}, ${registeredOffice.postal_code}`
    }
    return formattedAddress
  }
}
