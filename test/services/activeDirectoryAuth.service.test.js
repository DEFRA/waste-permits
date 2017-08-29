'use strict'

const config = require('../../src/config/config')

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const nock = require('nock')

const ActiveDirectoryAuthService = require('../../src/services/activeDirectoryAuth.service')

let authService

let authTokenResponse = {
  token_type: 'Bearer',
  scope: 'user_impersonation',
  expires_in: '3600',
  ext_expires_in: '0',
  expires_on: '1503328515',
  not_before: '1503324615',
  resource: config.resourceAddr,
  access_token: '__ACCESS_TOKEN__'
}

lab.beforeEach((done) => {
  authService = new ActiveDirectoryAuthService()

  // Mock the CRM token endpoint
  nock(`https://${config.azureAuthHost}`)
    .post(config.azureAuthPath)
    .reply(200, authTokenResponse)

  done()
})

lab.afterEach((done) => {
  nock.cleanAll()
  done()
})

lab.experiment('CRM Token Service tests:', () => {
  lab.test('Get token method should return the correct CRM token', (done) => {
    authService.getToken().then((authToken) => {
      Code.expect(authToken).to.equal(authTokenResponse.access_token)

      done()
    })
  })
})
