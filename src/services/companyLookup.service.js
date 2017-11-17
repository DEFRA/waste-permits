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
      // TODO work out correct URL
      uri: `${config.COMPANIES_HOUSE_SERVICE}/company/${companyNumber}/directors`,
      auth: {
        'username': config.COMPANIES_HOUSE_API_KEY,
        'password': ''
      },
      json: true
    }

    let directors
    await rp(options)
      .then((data) => {
        console.log('DATA:', data)                    
        if (data) {
          console.log('has DATA:', data)            
      
          // companyName = data['company_name']

          // Convert the company name to upper case (in case it isn't already)
          // if (companyName) {
          //   companyName = companyName.toUpperCase()
          // }
        }
      })
      .catch((error) => {
        console.log('error:', error)                    
        
        if (error.statusCode !== 404) {
          throw error
        }
      })

      // TODO remove this once the service call is working
      directors = [
        {
          name: 'Bob Bobbins1',
          monthAndYear: 'May 1962'
        }, {
          name: 'Bob Bobbins2',
          monthAndYear: 'May 1962'
        }, {
          name: 'Bob Bobbins3',
          monthAndYear: 'May 1962'
        }, {
          name: 'Bob Bobbins4',
          monthAndYear: 'May 1962'
        }
      ]

    return directors
  }
}
