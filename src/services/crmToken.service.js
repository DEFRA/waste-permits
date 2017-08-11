'use strict'

const https = require('https')
const config = require('../config/config')

module.exports = class CrmTokenService {
  constructor () {
    // Get the authorization endpoint host name
    const authHost = config.tokenEndpoint.split('/')[0]

    // Get the authorization endpoint path
    const authPath = '/' + config.tokenEndpoint.split('/').slice(1).join('/')

    // Build the authorization query request parameters
    // To learn more about how tokens work, see IETF RFC 6749 - https://tools.ietf.org/html/rfc6749
    this._queryParams = 'client_id=' + config.clientId +
      '&resource=' + encodeURIComponent(config.crmOrg) +
      '&username=' + encodeURIComponent(config.username) +
      '&password=' + encodeURIComponent(config.userPassword) +
      '&grant_type=password'

    // Set the token request parameters
    this._options = {
      host: authHost,
      path: authPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(this._queryParams)
      }
    }
  }

  getToken () {
    return new Promise((resolve, reject) => {
      // Make the token request
      const tokenRequest = https.request(this._options, (response) => {
        // Create an array to hold the response parts if we get multiple parts
        const responseParts = []

        response.setEncoding('utf8')
        response.on('data', function (chunk) {
          // Add each response chunk to the responseParts array
          responseParts.push(chunk)
        })

        response.on('end', function () {
          // Once we have all the response parts, concatenate the parts into a single string
          const completeResponse = responseParts.join('')

          // Parse the response JSON and extract the token
          const tokenResponse = JSON.parse(completeResponse)
          const token = tokenResponse.access_token

          resolve(token)
        })
      })

      tokenRequest.on('error', function (e) {
        console.error(e)
        reject(e)
      })

      // Post the token request data
      tokenRequest.write(this._queryParams)

      // Close the token request
      tokenRequest.end()
    })
  }
}
