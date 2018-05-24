'use strict'

const AdalNode = require('adal-node')

const config = require('../config/config')
const LoggingService = require('../services/logging.service')

module.exports = class ActiveDirectoryAuthService {
  getToken () {
    return new Promise((resolve, reject) => {
      // Make the token request

      const authorityHostUrl = `https://${config.azureAuthHost}`
      const tenant = config.azureAuthTenant // AAD Tenant name.
      const authorityUrl = authorityHostUrl + '/' + tenant
      const clientId = config.serverToServerClientId // Application Id of app registered under AAD.
      const clientSecret = config.serverToServerClientSecret // Secret generated for app. Read this environment constiable.
      const resource = config.resourceAddr // URI that identifies the resource for which the token is valid.

      const AuthenticationContext = AdalNode.AuthenticationContext
      const context = new AuthenticationContext(authorityUrl)

      context.acquireTokenWithClientCredentials(resource, clientId, clientSecret, function (err, tokenResponse) {
        if (err) {
          LoggingService.logError(err.message)
          reject(err)
        } else {
          const token = tokenResponse.accessToken
          if (token) {
            resolve(token)
          } else {
            const error = new Error(`Error obtaining Active Directory auth token: ${JSON.stringify(tokenResponse)}`)
            LoggingService.logError(error.message)
            reject(error)
          }
        }
      })
    })
  }
}
