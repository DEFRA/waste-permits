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

  done()
})

lab.afterEach((done) => {
  nock.cleanAll()
  done()
})

lab.experiment('Active Directory Auth Service tests:', () => {
  lab.test('getToken() should return the correct authentication token', (done) => {
    // Mock the CRM token endpoint
    setHttpMock()

    authService.getToken().then((authToken) => {
      Code.expect(authToken).to.equal(authTokenResponse.access_token)

      done()
    })
  })

  lab.test('getToken() times out based on app configuration', (done) => {
    // Mock the CRM token endpoint
    setHttpMock(7000)

    authService.getToken()
      .catch((error) => {
        Code.expect(error.message).to.equal('socket hang up')
        done()
      })
  })
})

const setHttpMock = (delay) => {
  if (delay) {
    return nock(`https://${config.azureAuthHost}`)
      .post(config.azureAuthPath)
      .socketDelay(delay)
      .reply(200, authTokenResponse)
  } else {
    return nock(`https://${config.azureAuthHost}`)
      .post(config.azureAuthPath)
      .reply(200, authTokenResponse)
  }
}
