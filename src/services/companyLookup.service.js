'use strict'

const moment = require('moment')
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

          // Convert the company name to upper case (in case it isn't already)
          if (companyName) {
            companyName = companyName.toUpperCase()
          }
        }
      })
      .catch((error) => {
        if (error.statusCode !== 404) {
          throw error
        }
      })

    return companyName
  }

  static async getDirectors (companyNumber) {
    const options = {
      uri: `${config.COMPANIES_HOUSE_SERVICE}/company/${companyNumber}/officers`,
      auth: {
        'username': config.COMPANIES_HOUSE_API_KEY,
        'password': ''
      },
      json: true
    }

    let directors = []
    await rp(options)
      .then((data) => {
        if (data) {
          for (let item of data.items) {
            const director = {}
            if (item.resigned_on !== undefined) {
              if (item.officer_role === 'director') {
                // Parse and split out the director details so they can be reformatted
                const nameParts = item.name.split(',')
                director.surname = nameParts[0].trim()
                director.forenames = nameParts[1].trim()

                // Pad with leading zero if required
                let month = item.date_of_birth.month.toString()
                if (month && month.length === 1) {
                  month = '0' + month
                }
                director.dateOfBirth = moment(`${item.date_of_birth.year}-${month}-01`).format('MMMM YYYY')

                directors.push(director)
              }
            }
          }
        }
      })
      .catch((error) => {
        if (error.statusCode !== 404) {
          throw error
        }
      })

      return directors
  }
}
