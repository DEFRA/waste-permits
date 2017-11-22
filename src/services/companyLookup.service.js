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
          // Retrieve the company status and convert to upper case and replace the hyphens with underscores
          const companyStatus = (data['company_status'] || '').toUpperCase().replace(/-/g, '_')
          company.companyStatus = COMPANY_STATUS_LIST.indexOf(companyStatus) !== -1 ? companyStatus : DEFAULT_COMPANY_STATUS
          company.isActive = (companyStatus === ACTIVE_COMPANY_STATUS)
          company.companyName = data['company_name']
        }
      })
      .catch((error) => {
        if (error.statusCode !== 404) {
          throw error
        }
      })

    return company
  }

  static async getCompanyName (companyNumber) {
    return (await this.getCompany(companyNumber)).companyName
  }
}
