'use strict'

const https = require('https')
const config = require('../config/config')
const ServerLoggingService = require('../services/serverLogging.service')

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

    // Set the token request parameters
    this.options = {
      host: config.azureAuthHost,
      path: config.azureAuthPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(this.queryParams)
      }
    }
  }

  getToken () {
    return new Promise((resolve, reject) => {
      // Make the token request
      const tokenRequest = https.request(this.options, (response) => {
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
            resolve(token)
          } else {
            reject(new Error('Error obtaining Active Directory auth token: ' + completeResponse))
          }
        })
      })

      tokenRequest.on('error', (error) => {
        ServerLoggingService.logError(error)
        reject(error)
      })

      // Post the token request data
      tokenRequest.write(this.queryParams)

      // Close the token request
      tokenRequest.end()
    })
  }
}
