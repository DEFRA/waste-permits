'use strict'

const rp = require('request-promise')

const config = require('../config/config')
const LoggingService = require('../services/logging.service')

module.exports = class AddressLookupService {
  static async getAddressesFromPostcode (postcode) {
    const options = {
      uri: config.ADDRESS_LOOKUP_SERVICE + '/addresses/postcode',
      qs: {
        'query-string': postcode,
        key: config.ADDRESS_LOOKUP_SERVICE_KEY
      },
      json: true
    }

    let addresses
    await rp(options)
      .then((data) => {
        // Extract the concatenated address string from the address entries in the returned data
        addresses = data.results.map((addressEntry, index, array) => {
          return addressEntry.address
        })
      })
      .catch((error) => {
        LoggingService.logError(error)
        throw error
      })

    return addresses
  }
}
