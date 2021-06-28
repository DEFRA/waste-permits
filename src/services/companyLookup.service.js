'use strict'

const rp = require('request-promise')

const LoggingService = require('../services/logging.service')
const config = require('../config/config')
const Constants = require('../constants')
const COMPANY_STATUS_LIST = Object.keys(Constants.Company.Status)
const DEFAULT_COMPANY_STATUS = 'NOT_ACTIVE'
const ACTIVE_COMPANY_STATUS = 'ACTIVE'

module.exports = class CompanyLookupService {
  static async getCompany (companyNumber) {
    const options = {
      uri: `${config.COMPANIES_HOUSE_SERVICE}/company/${companyNumber}`,
      json: true,
      proxy: ''
    }

    LoggingService.logDebug(`CompanyLookupService - looking up company details for Company Number: ${companyNumber}`)
    LoggingService.logDebug('CompanyLookupService request options:', options)

    let company
    await rp(options)
      .then((data) => {
        if (data) {
          LoggingService.logDebug('CompanyLookupService - retrieved data:', data)

          const formattedCompanyStatus = CompanyLookupService._formatCompanyStatus(data.company_status)
          const formattedCompanyType = CompanyLookupService._formatCompanyType(data.type)

          company = {
            name: data.company_name,
            address: CompanyLookupService._formatAddress(data.registered_office_address),
            status: (COMPANY_STATUS_LIST.includes(formattedCompanyStatus) ? formattedCompanyStatus : DEFAULT_COMPANY_STATUS),
            type: formattedCompanyType,
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

  static async getActiveOfficers (companyNumber, type) {
    const options = {
      uri: `${config.COMPANIES_HOUSE_SERVICE}/company/${companyNumber}/officers`,
      json: true,
      proxy: ''
    }

    LoggingService.logDebug(`CompanyLookupService - looking up officers for Company Number: ${companyNumber}`)
    LoggingService.logDebug('CompanyLookupService request options:', options)

    let active = []
    await rp(options)
      .then((data) => {
        if (data && data.items) {
          LoggingService.logDebug('CompanyLookupService - retrieved data:', data)
          if (type) {
            active = data.items.filter((officer) => officer.officer_role === type && !officer.resigned_on)
          } else {
            active = data.items.filter((officer) => !officer.resigned_on)
          }
        }
      })
      .catch((error) => {
        if (error.statusCode !== 404) {
          throw error
        }
      })

    return active
  }

  static async getActiveDirectors (companyNumber) {
    return this.getActiveOfficers(companyNumber, 'director')
  }

  static async getActiveDesignatedMembers (companyNumber) {
    return this.getActiveOfficers(companyNumber, 'llp-designated-member')
  }

  // Convert to upper case and replaces the hyphens with underscores
  static _formatCompanyStatus (companyStatus) {
    return (companyStatus || '').toUpperCase().replace(/-/g, '_')
  }

  // Convert to upper case and replaces the hyphens with underscores
  static _formatCompanyType (companyType) {
    return (companyType || '').toUpperCase().replace(/-/g, '_')
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

      for (const field of addressFields) {
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
