'use strict'

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
  resource: 'https://envregdev.crm4.dynamics.com',
  access_token: '__ACCESS_TOKEN__'
}

lab.beforeEach((done) => {
  authService = new ActiveDirectoryAuthService()

  // Mock the CRM token endpoint
  nock('https://login.microsoftonline.com')
    .post('/02958295-d8ae-4368-9e90-3c8230470218/oauth2/token')
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
