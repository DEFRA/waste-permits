'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const nock = require('nock')

const CrmTokenService = require('../../src/services/crmToken.service')

let crmTokenService

let crmTokenResponse = {
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
  crmTokenService = new CrmTokenService()

  // Mock the CRM token endpoint
  nock('https://login.microsoftonline.com')
    .post('/02958295-d8ae-4368-9e90-3c8230470218/oauth2/token')
    .reply(200, crmTokenResponse)

  done()
})

lab.afterEach((done) => {
  nock.cleanAll()
  done()
})

lab.experiment('CRM Token Service tests:', () => {
  lab.test('Get token method should return the correct CRM token', (done) => {
    crmTokenService.getToken().then((crmToken) => {
      Code.expect(crmToken).to.equal(crmTokenResponse.access_token)

      done()
    })
  })
})
