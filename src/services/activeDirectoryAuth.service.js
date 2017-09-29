'use strict'

const url = require('url')
const https = require('https')
const HttpsProxyAgent = require('https-proxy-agent')
const config = require('../config/config')
const LoggingService = require('../services/logging.service')

module.exports = class ActiveDirectoryAuthService {
  constructor () {
    // Build the authorization query request parameters
    // To learn more about how tokens work, see IETF RFC 6749 - https://tools.ietf.org/html/rfc6749
    this.queryParams =
      `client_id=${config.clientId}` +
      `&resource=${encodeURIComponent(config.resourceAddr)}` +
      `&username=${encodeURIComponent(config.dynamicsUsername)}` +
      `&password=${encodeURIComponent(config.dynamicsPassword)}` +
      `&grant_type=password`
  }

  _requestOptions () {
    const options = url.parse(`https://${config.azureAuthHost}${config.azureAuthPath}`)
    options.method = 'POST'
    options.headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(this.queryParams)
    }
    if (config.http_proxy) {
      options.agent = new HttpsProxyAgent(config.http_proxy)
    }

    return options
  }

  getToken () {
    return new Promise((resolve, reject) => {
      // Make the token request
      const tokenRequest = https.request(this._requestOptions(), (response) => {
        // Create an array to hold the response parts if we get multiple parts
        const responseParts = []

        response.setEncoding('utf8')
        response.on('data', (chunk) => {
          // Add each response chunk to the responseParts array
          responseParts.push(chunk)
        })

        response.on('end', () => {
          // Once we have all the response parts, concatenate the parts into a single string
          const completeResponse = responseParts.join('')

          // Parse the response JSON and extract the CRM access token
          const tokenResponse = JSON.parse(completeResponse)

          const token = tokenResponse.access_token
          if (token) {
            console.log('Got a token')
            console.log(token)
            resolve(token)
          } else {
            reject(new Error('Error obtaining Active Directory auth token: ' + completeResponse))
          }
        })
      })

      tokenRequest.on('error', (error) => {
        LoggingService.logError(error)
        reject(error)
      })

      tokenRequest.setTimeout(config.requestTimeout, () => {
        LoggingService.logError('Active directory auth request timed out')
        tokenRequest.abort()
      })

      // Post the token request data
      tokenRequest.write(this.queryParams)

      // Close the token request
      tokenRequest.end()
    })
  }
}
