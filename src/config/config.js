// Load application configuration using Dotenv
// (see https://www.npmjs.com/package/dotenv)
require('dotenv').config()
const CommitHashService = require('../services/commitHash.service')

const config = module.exports = {}

config.port = process.env.PORT || 8000
config.nodeEnvironment = process.env.NODE_ENV || 'PRODUCTION'

// Password used for HMAC key generation, which is used to validate that a
// value in the cookie was generated by the server
config.cookieValidationPassword = process.env.COOKIE_VALIDATION_PASSWORD

// Use the CommitHashService to determine what the lastest git commit sha
config.gitSha = CommitHashService.commitHash()

// When the app is making requests to Azure Active Directory or MS Dynamics how
// long it should wait (in milliseconds) before timing out the attempt
config.requestTimeout = parseInt(process.env.REQUEST_TIMEOUT) || 5000

// Password used for HMAC key generation, which is used to validate that a
// value in the cookie was generated by the server
config.cookieValidationPassword = process.env.COOKIE_VALIDATION_PASSWORD

// Domain name or IP address of the server to issue the azure AD auth request
// to. Passed in as value for `host:` option when we make the https.request()
// call
config.azureAuthHost = process.env.AZURE_ACTIVE_DIRECTORY_HOST || 'login.microsoftonline.com'

// OAuth token endpoint for App registered with Azure AD.
// This appended to AZURE_ACTIVE_DIRECTORY_HOST gives the full url.
// Passed in as value for `path:` option when we make the https.request() call
config.azureAuthPath = process.env.AZURE_ACTIVE_DIRECTORY_PATH || '/12345678-oi98-4321-8y8o-8y9456987123/oauth2/token'

// Client ID for this app registered with Azure AD
config.clientId = process.env.DYNAMICS_CLIENT_ID

// Your Dynamics root service address, which Azure AD uses to identify which
// resource you are trying to authenticate with
config.resourceAddr = process.env.DYNAMICS_RESOURCE_ADDR || 'https://mycrminstance.crm4.dynamics.com'

// The app's Dynamics Username. When we authenticate with Azure AD rather than
// taking a user to a web page where they can enter credentials and then
// authenticate themselves with Dynamics, the app itself is authenticating as
// user. So a username and password is needed
config.dynamicsUsername = process.env.DYNAMICS_USERNAME

// The app's Dynamics Password
config.dynamicsPassword = process.env.DYNAMICS_PASSWORD

// Dynamics host address for queries via its web API
config.dynamicsWebApiHost = process.env.DYNAMICS_WEB_API_HOST || 'mycrminstance.api.crm4.dynamics.com'

// Dynamics path for queries via its web API.
// This appended to CRM_WEB_API_HOST gives the full url for the web API
config.dynamicsWebApiPath = process.env.DYNAMICS_WEB_API_PATH || '/api/data/v8.2/'

config.getAddress = (url) => {
  let result
  if (url) {
    console.log(url)
    const parts = url.split(':')
    result = `${parts[0]}:${parts[1]}`
  }
  return result
}

config.getPort = (url) => {
  let result
  if (url && url) {
    const parts = url.split(':')
    result = parseInt(parts[2])
  }
  return result
}

config.http_proxy = config.getAddress(process.env.http_proxy)
config.http_proxy_port = config.getPort(process.env.http_proxy)
