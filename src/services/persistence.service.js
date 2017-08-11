'use strict'

const https = require('https')
const config = require('../config/config')

module.exports = class PersistenceService {
  constructor () {
    console.log('PersistenceService constructor')

    // Set the CRM request parameters
    this._crmRequestOptions = {
      host: config.crmWebApiHost,
      method: 'GET',
      headers: {
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'Prefer': 'odata.maxpagesize=500, odata.include-annotations=OData.Community.Display.V1.FormattedValue'
      }
    }
  }

  createContact (contact, crmToken) {

  }

  listContacts (crmToken) {
    return new Promise((resolve, reject) => {
      if (!crmToken) {
        reject(new Error('CRM token not found'))
        return
      }

      // Basic query to select contacts
      this._crmRequestOptions.path = config.crmWebApiPath + 'contacts?$select=fullname,contactid'

      // Set the CRM token in the headers
      this._crmRequestOptions.headers.Authorization = 'Bearer ' + crmToken

      // Make the Web API request
      const crmRequest = https.request(this._crmRequestOptions, function (response) {
        // Make an array to hold the response parts if we get multiple parts
        const responseParts = []
        response.setEncoding('utf8')
        response.on('data', function (chunk) {
          // Add each response chunk to the responseParts array for later
          responseParts.push(chunk)
        })
        response.on('end', function () {
          // Concatenate the data parts into a single string and parse into JSON
          const contacts = JSON.parse(responseParts.join('')).value

          resolve(contacts)
        })
      })
      crmRequest.on('error', function (e) {
        // TODO log the error ?
        console.error('An error occurred: ' + e)
        reject(e)
      })

      crmRequest.end()
    })
  }
}
