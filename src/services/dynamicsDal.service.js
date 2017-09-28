'use strict'

const url = require('url')
const https = require('https')
const HttpsProxyAgent = require('https-proxy-agent')
const config = require('../config/config')
const LoggingService = require('../services/logging.service')

module.exports = class DynamicsDalService {
  constructor (authToken) {
    this.crmRequestOptions = this._requestOptions(authToken)
  }

  _requestOptions (authToken) {
    const options = url.parse(`https://${config.dynamicsWebApiHost}`)
    options.headers = {
      'Authorization': `Bearer ${authToken}`,
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      'Prefer': 'odata.maxpagesize=500, odata.include-annotations=OData.Community.Display.V1.FormattedValue'
    }
    if (config.http_proxy) {
      options.agent = new HttpsProxyAgent(config.http_proxy)
    }
    console.log(options)

    return options
  }

  async create (query, dataObject) {
    this._setCallSpecificRequestOptions(query, 'POST', dataObject)
    const result = await this._call(query, dataObject)
    const id = this._extractId(result)
    return id
  }

  async update (query, dataObject) {
    this._setCallSpecificRequestOptions(query, 'PATCH', dataObject)
    this._call(query, dataObject)
  }

  async search (query) {
    this._setCallSpecificRequestOptions(query, 'GET')
    const result = await this._call(query)
    return result
  }

  _setCallSpecificRequestOptions (query, method, dataObject = undefined) {
    // Combine the path to Dynamics and the query and add it to our request options
    this.crmRequestOptions.path = `${config.dynamicsWebApiPath}${query}`
    this.crmRequestOptions.method = method

    // Set the content length
    if (dataObject) {
      const contentLength = Buffer.byteLength(JSON.stringify(dataObject))
      this.crmRequestOptions.headers['Content-Length'] = contentLength
    }
  }

  _call (query, dataObject = undefined) {
    return new Promise((resolve, reject) => {
      // Query Dynamics for the data via a HTTPS request
      const crmRequest = https.request(this.crmRequestOptions, (response) => {
        response.setEncoding('utf8')

        // We use an array to hold the response parts in the event we get multiple parts returned
        const responseParts = []
        response.on('data', (chunk) => {
          responseParts.push(chunk)
        })
        response.on('end', () => {
          switch (response.statusCode) {
            case 200:
              // Parse the response JSON
              resolve(JSON.parse(responseParts.join('')))
              break
            case 204:
              resolve(response.headers['odata-entityid'])
              break
            default:
              const message = `Unknown response from Dynamics. Code: ${response.statusCode} Message: ${response.statusMessage}`
              reject(message)
          }
        })
      })
      crmRequest.on('error', (error) => {
        LoggingService.logError('Dynamics error: ' + error)
        reject(error)
      })

      crmRequest.setTimeout(config.requestTimeout, () => {
        LoggingService.logError('Dynamics request timed out')
        crmRequest.abort()
      })

      // Write the data
      if (dataObject) {
        crmRequest.write(JSON.stringify(dataObject))
      }

      // Close the Web Api request
      crmRequest.end()
    })
  }

  /*
    Extracts id of an entity from the value Dynamics returns

    Rather than providing the ID in the response body, when performing either a POST or PATCH Dynamics will return
    the full url to the entity which includes the ID, and place it in a custom header. For example

    'odata-entityid': https://mycrminstance.api.crm4.dynamics.com/api/data/v8.2/contacts(7a8e4354-4f24-e711-80fd-5065f38a1b01)

    As we only want the id, we use a regex to extract it. The regex works in the following way

    \( matches the character ( literally (case sensitive)
      1st Capturing Group (.*?)
        .*? matches any character (except for line terminators)
        *? Quantifier — Matches between zero and unlimited times, as few times as possible, expanding as needed (lazy)
    \) matches the character ) literally (case sensitive)
      Global pattern flags
        g modifier: global. All matches (don't return after first match)

    Detailed explanation courtesy of https://regex101.com/
    The full match is (7a8e4354-4f24-e711-80fd-5065f38a1b01). Requesting group 1 gives
    us 7a8e4354-4f24-e711-80fd-5065f38a1b01
  */
  _extractId (responseValue) {
    const id = /\((.*?)\)/.exec(responseValue)[1]
    return id
  }
}
