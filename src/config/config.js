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

  // OAuth token endpoint for App registered with Azure AD. Passed in as value
  // for `path:` option when we make the https.request() call
  azureAuthPath: process.env.AZURE_ACTIVE_DIRECTORY_PATH,

  // Client ID for App registered with Azure AD
  clientId: process.env.CRM_CLIENT_ID,

  // https://CRMORG...dynamics.com
  crmOrg: process.env.CRM_ORG,

  // CRM Username
  username: process.env.CRM_USERNAME,

  // CRM Password
  userPassword: process.env.CRM_PASSWORD,

  crmWebApiHost: process.env.CRM_WEB_API_HOST,

  crmWebApiPath: process.env.CRM_WEB_API_PATH,

  // CRM Tenant e.g. mycrminstance.onmicrosoft.com
  tenant: process.env.CRM_TENANT
}
