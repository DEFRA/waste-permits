'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const msalNode = require('@azure/msal-node')
const ActiveDirectoryAuthService = require('../../src/services/activeDirectoryAuth.service')
const config = require('../../src/config/config')

let sandbox
let fakeConfig
const fakeAccessToken = 'FAKE_ACCESS_TOKEN'
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

  const ConfidentialClientApplication = class {
    constructor (configuration) {
      Code.expect(configuration).to.exist()
      Code.expect(configuration.auth).to.exist()
      Code.expect(configuration.auth).to.equal({
        clientId: fakeConfig.clientId,
        clientSecret: fakeConfig.clientSecret,
        authority: `https://${fakeConfig.host}/${fakeConfig.tenant}`
      })
    }

    async acquireTokenByClientCredential (request) {
      Code.expect(request).to.exist()
      Code.expect(request.scopes).to.exist()
      Code.expect(request.scopes[0]).to.exist()
      Code.expect(request.scopes[0]).to.equal(`${fakeConfig.resource}/.default`)

      if (err) {
        throw err
      } else {
        return tokenResponse
      }
    }
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()
  sandbox.stub(msalNode, 'ConfidentialClientApplication').value(ConfidentialClientApplication)
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

    lab.test('returns the correct authentication token', async () => {
      const authService = new ActiveDirectoryAuthService()
      const authToken = await authService.getToken()
      Code.expect(authToken).to.equal(fakeAccessToken)
    })

    lab.test('reports error if the token lookup fails', async () => {
      const authService = new ActiveDirectoryAuthService()
      err = new Error('Failed')
      let msg
      await authService.getToken().catch(({ message }) => {
        msg = message
      })
      Code.expect(msg).to.equal('Failed')
    })

    lab.test('reports error if token lookup does not return a token', async () => {
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
