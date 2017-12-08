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
      json: true
    }

    let company
    await rp(options)
      .then((data) => {
        if (data) {
          const formattedCompanyStatus = CompanyLookupService._formatCompanyStatus(data.company_status)

          company = {
            name: data.company_name,
            address: CompanyLookupService._formatAddress(data.registered_office_address),
            status: (COMPANY_STATUS_LIST.includes(formattedCompanyStatus) ? formattedCompanyStatus : DEFAULT_COMPANY_STATUS),
            isActive: (formattedCompanyStatus === ACTIVE_COMPANY_STATUS)
          }
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

  // Format the address that has come back from Companies House
  static _formatAddress (registeredOffice) {
    let formattedAddress = ''
    if (registeredOffice) {
      const addressFields = [
        'po_box',
        'premises',
        'address_line_1',
        'address_line_2',
        'locality',
        'region',
        'postal_code'
      ]

      for (let field of addressFields) {
        if (registeredOffice[field] && registeredOffice[field].length > 0) {
          formattedAddress += `${registeredOffice[field]}, `
        }
      }

      // Strip the trailing comma and space
      if (formattedAddress.length > 2) {
        formattedAddress = formattedAddress.slice(0, -2)
      }
    }

    return formattedAddress
  }
}
