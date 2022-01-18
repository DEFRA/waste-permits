'use strict'

const msalNode = require('@azure/msal-node')

const config = require('../config/config')
const LoggingService = require('../services/logging.service')

module.exports = class ActiveDirectoryAuthService {
  async getToken () {
    // Make the token request

    const authorityHostUrl = `https://${config.azureAuthHost}`
    const tenant = config.azureAuthTenant // AAD Tenant name.
    const authority = authorityHostUrl + '/' + tenant
    const clientId = config.serverToServerClientId // Application Id of app registered under AAD.
    const clientSecret = config.serverToServerClientSecret // Secret generated for app.
    const resource = config.resourceAddr // URI that identifies the resource for which the token is valid.
    const scopes = [resource + '/.default'] // List of permissions scopes required, '.default' provides the pre-defined scopes

    const ConfidentialClientApplication = msalNode.ConfidentialClientApplication
    const cca = new ConfidentialClientApplication({
      auth: {
        clientId,
        clientSecret,
        authority
      }
    })

    try {
      const tokenResponse = await cca.acquireTokenByClientCredential({ scopes })
      const token = tokenResponse.accessToken
      if (token) {
        return token
      } else {
        const error = new Error(`Error obtaining Active Directory auth token: ${JSON.stringify(tokenResponse)}`)
        throw error
      }
    } catch (err) {
      LoggingService.logError(err.message)
      throw err
    }
  }
}
