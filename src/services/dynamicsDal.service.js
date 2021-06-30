'use strict'

const rp = require('request-promise')

const url = require('url')
const https = require('https')
const HttpsProxyAgent = require('https-proxy-agent')
const config = require('../config/config')
const LoggingService = require('../services/logging.service')
const Utilities = require('../utilities/utilities')
const ActiveDirectoryAuthService = require('../services/activeDirectoryAuth.service')
const authService = new ActiveDirectoryAuthService()

class DalError extends Error {
  constructor (message = '', query = '', dataObject, dynamicsStack, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DalError)
    }

    // Custom debugging information
    this.query = query
    this.dataObject = dataObject
    this.message = message
    this.dynamicsStack = dynamicsStack
    this.date = new Date()
  }
}

class DynamicsDalService {
  async getAuthToken () {
    if (!this._authToken) {
      this._authToken = await authService.getToken()
      setTimeout(() => {
        delete this._authToken
      }, 30 * 60 * 1000)
    }
    return this._authToken
  }

  get dynamicsPath () {
    return `https://${config.dynamicsWebApiHost}${config.dynamicsWebApiPath}`
  }

  async callAction (action, dataObject) {
    let result
    const options = {
      method: 'POST',
      uri: `${this.dynamicsPath}${action}`,
      json: true,
      body: dataObject,
      headers: {
        Authorization: `Bearer ${await this.getAuthToken()}`
      }
    }
    LoggingService.logDebug('Dynamics Call Action POST options', options)
    await rp(options)
      .then((data) => {
        result = data
      })
      .catch((error) => {
        LoggingService.logError('Error calling Dynamics action: ', error)
        throw error
      })
    return result
  }

  async link (query, association) {
    const options = this._requestOptions(await this.getAuthToken(), query, 'POST', association)
    LoggingService.logDebug('Dynamics POST options', options)
    return this._call(options, association)
  }

  async create (query, dataObject) {
    Utilities.convertToDynamics(dataObject)
    const options = this._requestOptions(await this.getAuthToken(), query, 'POST', dataObject)
    LoggingService.logDebug('Dynamics POST options', options)
    const result = await this._call(options, dataObject)
    const id = this._extractId(result)
    return id
  }

  async update (query, dataObject) {
    Utilities.convertToDynamics(dataObject)
    const options = this._requestOptions(await this.getAuthToken(), query, 'PATCH', dataObject)
    LoggingService.logDebug('Dynamics PATCH options', options)
    LoggingService.logDebug('Dynamics PATCH body', dataObject)
    await this._call(options, dataObject)
  }

  async delete (query) {
    const options = this._requestOptions(await this.getAuthToken(), query, 'DELETE')
    LoggingService.logDebug('Dynamics DELETE options', options)
    const result = await this._call(options)
    return result
  }

  async search (query) {
    const options = this._requestOptions(await this.getAuthToken(), query, 'GET')
    LoggingService.logDebug('Dynamics GET options', options)
    const result = await this._call(options)
    return result
  }

  _requestOptions (authToken, query, method, dataObject = undefined) {
    // Temporarily disable rule against using deprecated APIs; changing this to 'new URL()' does not work without
    // further modification which is out of scope for now.
    /* eslint-disable node/no-deprecated-api */
    const options = url.parse(`${this.dynamicsPath}${query}`)
    /* eslint-enable */
    options.method = method
    options.headers = {
      Authorization: `Bearer ${authToken}`,
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      Prefer: 'odata.maxpagesize=500, odata.include-annotations=OData.Community.Display.V1.FormattedValue'
    }
    // Set the content length
    if (dataObject) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(dataObject))
    }
    if (config.http_proxy) {
      options.agent = new HttpsProxyAgent(config.http_proxy)
    }

    return options
  }

  _call (options, dataObject = undefined) {
    return new Promise((resolve, reject) => {
      // Query Dynamics for the data via a HTTPS request
      const crmRequest = https.request(options, (response) => {
        response.setEncoding('utf8')

        // We use an array to hold the response parts in the event we get multiple parts returned
        const responseParts = []
        response.on('data', (chunk) => {
          LoggingService.logDebug(undefined, chunk)
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
            default: {
              let crmMessage = ''
              if (responseParts.length) {
                try {
                  const crmResponse = JSON.parse(responseParts.join(''))
                  if (crmResponse && crmResponse.error && crmResponse.error.message) {
                    crmMessage = crmResponse.error.message
                    if (crmResponse.error.innererror) {
                      const { message, stacktrace, type } = crmResponse.error.innererror
                      LoggingService.logError(`${type}: ${message}\n${stacktrace}`)
                      reject(new DalError(message, options.path, dataObject, stacktrace))
                    }
                  }
                } catch (err) {
                  crmMessage = responseParts.join('')
                }
              }
              const message = crmMessage ? `Bad response from Dynamics. Code: ${response.statusCode}, Message: ${crmMessage}` : `Unknown response from Dynamics. Code: ${response.statusCode}, Message: ${response.statusMessage}`
              reject(new Error(message))
            }
          }
        })
      })
      crmRequest.on('error', (error) => {
        const { message, stack, code } = error
        LoggingService.logError(`${code}: ${message}\n${stack}`)
        reject(new DalError(message, options.path, dataObject, stack))
      })

      if (dataObject && dataObject.documentbody) {
        crmRequest.setTimeout(config.uploadRequestTimeout, () => {
          LoggingService.logError('Dynamics upload request timed out')
          crmRequest.abort()
        })
      } else {
        crmRequest.setTimeout(config.requestTimeout, () => {
          LoggingService.logError('Dynamics request timed out')
          crmRequest.abort()
        })
      }

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

module.exports = new DynamicsDalService()
