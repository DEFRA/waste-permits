'use strict'

const https = require('https')
const config = require('../config/config')

module.exports = class DynamicsService {
  constructor (crmToken) {
    // this._crmToken = crmToken

    this._crmRequestOptions = {
      host: config.crmWebApiHost,
      headers: {
        'Authorization': 'Bearer ' + crmToken,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'Prefer': 'odata.maxpagesize=500, odata.include-annotations=OData.Community.Display.V1.FormattedValue'
      }
    }
  }

  create (dataObject, query) {
    return this.runQuery('POST', query, dataObject)
  }

  update (dataObject, query) {
    return this.runQuery('PATCH', query, dataObject)
  }

  list (query) {
    return this.runQuery('GET', query)
  }

  runQuery (method, query, dataObject = undefined) {
    console.log('Running Dynamics query:\n..Query string: ' + query + '\n..Method: ' + method + '\n..Data object: ' + dataObject)

    return new Promise((resolve, reject) => {
      // TODO: Validate the CRM Token?
      // if (!this._crmToken) {
      //   reject(new Error('CRM token not found'))
      //   return
      // }

      // Set the query e.g. 'contacts?$select=fullname,contactid'
      this._crmRequestOptions.path = config.crmWebApiPath + query

      // Set the request method and CRM token
      this._crmRequestOptions.method = method

      if (dataObject) {
        // Set the content length
        const contentLength = Buffer.byteLength(JSON.stringify(dataObject))
        this._crmRequestOptions.headers['Content-Length'] = contentLength
      }

      // make the web api request
      const crmRequest = https.request(this._crmRequestOptions, function (response) {
        // Make an array to hold the response parts if we get multiple parts
        const responseParts = []
        response.setEncoding('utf8')
        response.on('data', function (chunk) {
          responseParts.push(chunk)
        })
        response.on('end', function () {
          console.log('Dynamics query response:\n..Status code: ' + response.statusCode + '\n..Status message: ' + response.statusMessage)

          switch (response.statusCode) {
            case 200:
              // Parse the response JSON
              resolve(JSON.parse(responseParts.join('')).value)
              break
            case 204:
              resolve()
              break
            default:
              const message = 'Unknown response from Dynamics. Code: ' + response.statusCode +
                ' Message: ' + response.statusMessage
              console.error(message)
              reject(message)
          }
        })
      })
      crmRequest.on('error', function (e) {
        console.error(e)
        reject(e)
      })

      // Write the data
      if (dataObject) {
        console.log(JSON.stringify(dataObject))
        crmRequest.write(JSON.stringify(dataObject))
      }

      // Close the Web Api request
      crmRequest.end()
    })
  }
}
