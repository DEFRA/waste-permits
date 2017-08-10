// require('dotenv').config({silent: true})

module.exports = {

  // crmwebapihost: 'FOO CONFIG',
  crmWebApiHost: process.env.CRM_WEB_API_HOST,

  crmWebApiPath: process.env.CRM_WEB_API_PATH,

  // https://CRMORG...dynamics.com
  crmOrg: process.env.CRM_ORG,

  // Client ID for App registered with Azure AD
  clientId: process.env.CRM_CLIENT_ID,

  // CRM Username
  username: process.env.CRM_USERNAME,

  // CRM Password
  userPassword: process.env.CRM_PASSWORD,

  // OAuth token endpoint for App registered with Azure AD
  tokenEndpoint: process.env.CRM_TOKEN_ENDPOINT,

  // CRM Tenant e.g. mycrminstance.onmicrosoft.com
  tenant: process.env.CRM_TENANT
}
