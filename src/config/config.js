// Load application configuration using Dotenv
// (see https://www.npmjs.com/package/dotenv)
require('dotenv').config()

module.exports = {

  port: process.env.WASTE_PERMITS_APP_PORT,

  nodeEnvironment: process.env.NODE_ENV,

  // Domain name or IP address of the server to issue the azure AD auth request
  // to. Passed in as value for `host:` option when we make the https.request()
  // call
  azureAuthHost: process.env.AZURE_ACTIVE_DIRECTORY_HOST,

  // OAuth token endpoint for App registered with Azure AD.
  // This appended to AZURE_ACTIVE_DIRECTORY_HOST gives the full url.
  // Passed in as value for `path:` option when we make the https.request() call
  azureAuthPath: process.env.AZURE_ACTIVE_DIRECTORY_PATH,

  // Client ID for this app registered with Azure AD
  clientId: process.env.DYNAMICS_CLIENT_ID,

  // Your Dynamics root service address, which Azure AD uses to identify which
  // resource you are trying to authenticate with
  resourceAddr: process.env.DYNAMICS_RESOURCE_ADDR,

  // The app's Dynamics Username. When we authenticate with Azure AD rather than
  // taking a user to a web page where they can enter credentials and then
  // authenticate themselves with Dynamics, the app itself is authenticating as
  // user. So a username and password is needed
  dynamicsUsername: process.env.DYNAMICS_USERNAME,

  // The app's Dynamics Password
  dynamicsPassword: process.env.DYNAMICS_PASSWORD,

  // Dynamics host address for queries via its web API
  dynamicsWebApiHost: process.env.DYNAMICS_WEB_API_HOST,

  // Dynamics path for queries via its web API.
  // This appended to CRM_WEB_API_HOST gives the full url for the web API
  dynamicsWebApiPath: process.env.DYNAMICS_WEB_API_PATH
}
