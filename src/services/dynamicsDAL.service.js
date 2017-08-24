'use strict'

const https = require('https')
const config = require('../config/config')

module.exports = class DynamicsDALService {
  constructor (authToken) {
    this.crmRequestOptions = {
      host: config.dynamicsWebApiHost,
      headers: {
        'Authorization': 'Bearer ' + authToken,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'Prefer': 'odata.maxpagesize=500, odata.include-annotations=OData.Community.Display.V1.FormattedValue'
      }
    }
  }

  createItem (dataObject, query) {
    return this.runQuery('POST', query, dataObject)
  }

  updateItem (dataObject, query) {
    return this.runQuery('PATCH', query, dataObject)
  }

  listItems (query) {
    return this._query(query)
  }

  _query (query) {
    return new Promise((resolve, reject) => {
      // Combine the path to Dynamics and the query and add it to our request options
      this.crmRequestOptions.path = `${config.dynamicsWebApiPath}${query}`

      this.crmRequestOptions.method = 'GET'

      // Query Dynamics for the data via a HTTPS request
      const crmRequest = https.request(this.crmRequestOptions, function (response) {
        // We use an array to hold the response parts in the event we get multiple parts returned
        const responseParts = []
        response.setEncoding('utf8')
        response.on('data', function (chunk) {
          responseParts.push(chunk)
        })
        response.on('end', function () {
          console.log(`Dynamics query response: Status Code: ${response.statusCode} Message: ${response.statusMessage}`)

          if (response.statusCode === 200) {
            // Parse the response JSON
            resolve(JSON.parse(responseParts.join('')).value)
          } else {
            const message = `Unknown response from Dynamics. Code: ${response.statusCode} Message: ${response.statusMessage}`
            reject(message)
          }
        })
      })

      crmRequest.on('error', function (error) {
        console.error('Dynamics error: ' + error)
        reject(error)
      })

      // Close the Web Api request
      crmRequest.end()
    })
  }

  runQuery (method, query, dataObject = undefined) {
    // console.log('Running Dynamics query:\n..Query string: ' + query + '\n..Method: ' + method + '\n..Data object: ' + dataObject)

    return new Promise((resolve, reject) => {
      // Set the Dynamics query
      this.crmRequestOptions.path = config.dynamicsWebApiPath + query

      // Set the request method and CRM token
      this.crmRequestOptions.method = method

      if (dataObject) {
        // Set the content length
        const contentLength = Buffer.byteLength(JSON.stringify(dataObject))
        this.crmRequestOptions.headers['Content-Length'] = contentLength
      }

      // Make the web api request
      const crmRequest = https.request(this.crmRequestOptions, function (response) {
        // Make an array to hold the response parts if we get multiple parts
        const responseParts = []
        response.setEncoding('utf8')
        response.on('data', function (chunk) {
          responseParts.push(chunk)
        })
        response.on('end', function () {
          console.log(`Dynamics query response: Status Code: ${response.statusCode} Message: ${response.statusMessage}`)

          switch (response.statusCode) {
            case 200:
              // Parse the response JSON
              resolve(JSON.parse(responseParts.join('')).value)
              break
            case 204:
              resolve()
              break
            default:
              const message = `Unknown response from Dynamics. Code: ${response.statusCode} Message: ${response.statusMessage}`
              reject(message)
          }
        })
      })
      crmRequest.on('error', function (error) {
        console.error('Dynamics error: ' + error)
        reject(error)
      })

      // Write the data
      if (dataObject) {
        crmRequest.write(JSON.stringify(dataObject))
      }

      // Close the Web Api request
      crmRequest.end()
    })
  }
}
