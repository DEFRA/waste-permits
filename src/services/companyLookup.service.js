'use strict'

const rp = require('request-promise')

const config = require('../config/config')

module.exports = class CompanyLookupService {
  static async getCompanyName (companyNumber) {
    const options = {
      uri: `${config.COMPANIES_HOUSE_SERVICE}/company/${companyNumber}`,
      auth: {
        'username': config.COMPANIES_HOUSE_API_KEY,
        'password': ''
      },
      json: true
    }

    let companyName
    await rp(options)
      .then((data) => {
        if (data) {
          companyName = data['company_name']
        }
      })
      .catch((error) => {
        if (error.statusCode !== 404) {
          throw error
        }
      })

    return companyName
  }
}
