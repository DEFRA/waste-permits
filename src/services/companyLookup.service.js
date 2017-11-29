'use strict'

const moment = require('moment')
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
