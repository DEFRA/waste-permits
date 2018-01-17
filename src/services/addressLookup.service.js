'use strict'

// const rp = require('request-promise')

// const config = require('../config/config')

module.exports = class AddressLookupService {
  static async getAddressesFromPostcode (postcode) {
    // const options = {
    //   uri: `${config.ADDRESS_LOOKUP_SERVICE}/addresses/postcode?key=${config.ADDRESS_LOOKUP_SERVICE_KEY}&postcode=${postcode}`,
    //   json: true
    // }

    let addresses = []
    // await rp(options)
    //   .then((data) => {
    //     // Extract the concatenated address string from the address entries in the returned data
    //     addresses = data.results.map((addressEntry, index, array) => {
    //       return addressEntry.address
    //     })
    //   })
    //   .catch((error) => {
    //     if (error.statusCode === 400) {
    //       console.log('400 error')
    //     } else if (error.statusCode === 404) {
    //       console.log('404 error')
    //     } else {
    //       console.log(error)
    //       throw error
    //     }
    //   })

    return addresses
  }
}
