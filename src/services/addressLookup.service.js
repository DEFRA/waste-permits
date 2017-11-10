'use strict'

const rp = require('request-promise')

module.exports = class AddressLookupService {
  static async GetAddressesFromPostcode (postcode) {
    const key = 'client1'
    const options = {
      uri: 'http://ea-addressfacade1081.cloudapp.net/address-service/v1/addresses/postcode',
      qs: {
        'query-string': postcode,
        key: key
      },
      // headers: {
      //   'User-Agent': 'Request-Promise'
      // },
      json: true // Automatically parses the JSON string in the response
    }

    let addresses
    await rp(options)
      .then((result) => {
        // Extract the address string from the address entry
        addresses = result.results.map((addressEntry, index, array) => {
          return addressEntry.address
        })
      })
      .catch((err) => {
        // TODO handle error
        console.error(err)
        // API call failed...
      })

    return addresses

    // TODO lookup addresses
    // curl -X GET --header 'Accept: application/json' 'http://ea-addressfacade1081.cloudapp.net/address-service/v1/addresses/postcode?query-string=bs1%205ah&key=client1'
  }
}
