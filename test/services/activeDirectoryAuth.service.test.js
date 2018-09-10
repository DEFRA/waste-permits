'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const AdalNode = require('adal-node')
const ActiveDirectoryAuthService = require('../../src/services/activeDirectoryAuth.service')
const config = require('../../src/config/config')

let AuthenticationContext

let sandbox
let fakeConfig
let fakeAccessToken = 'FAKE_ACCESS_TOKEN'
let err
let tokenResponse

lab.beforeEach(() => {
  err = ''

  tokenResponse = {
    accessToken: fakeAccessToken
  }

  fakeConfig = {
    host: 'HOST',
    tenant: 'TENANT',
    clientId: 'CLIENT_ID',
    clientSecret: 'CLIENT_SECRET',
    resource: 'RESOURCE'
  }

  AuthenticationContext = class {
    constructor (authorityUrl) {
      Code.expect(authorityUrl).to.equal(`https://${fakeConfig.host}/${fakeConfig.tenant}`)
    }

    async acquireTokenWithClientCredentials (resource, clientId, clientSecret, callback) {
      Code.expect(resource).to.equal(fakeConfig.resource)
      Code.expect(clientId).to.equal(fakeConfig.clientId)
      Code.expect(clientSecret).to.equal(fakeConfig.clientSecret)
      return callback(err, tokenResponse)
    }
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()
  sandbox.stub(AdalNode, 'AuthenticationContext').value(AuthenticationContext)
  sandbox.stub(config, 'azureAuthHost').value(fakeConfig.host)
  sandbox.stub(config, 'azureAuthTenant').value(fakeConfig.tenant)
  sandbox.stub(config, 'serverToServerClientId').value(fakeConfig.clientId)
  sandbox.stub(config, 'serverToServerClientSecret').value(fakeConfig.clientSecret)
  sandbox.stub(config, 'resourceAddr').value(fakeConfig.resource)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Active Directory Auth Service tests:', () => {
  lab.experiment('getToken():', () => {
    lab.beforeEach(() => {
    })

    lab.test('should return the correct authentication token', async () => {
      const authService = new ActiveDirectoryAuthService()
      const authToken = await authService.getToken()
      Code.expect(authToken).to.equal(fakeAccessToken)
    })

    lab.test('should fail to return authentication token', async () => {
      const authService = new ActiveDirectoryAuthService()
      err = new Error('Failed')
      let msg
      await authService.getToken().catch(({ message }) => {
        msg = message
      })
      Code.expect(msg).to.equal('Failed')
    })

    lab.test('should return invalid authentication token', async () => {
      const authService = new ActiveDirectoryAuthService()
      tokenResponse = { broken: true }
      let msg
      await authService.getToken().catch(({ message }) => {
        msg = message
      })
      Code.expect(msg).to.equal(`Error obtaining Active Directory auth token: ${JSON.stringify(tokenResponse)}`)
    })
  })
})
