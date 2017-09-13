'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
// const DOMParser = require('xmldom').DOMParser
const server = require('../../server')

const ActiveDirectoryAuthService = require('../../src/services/activeDirectoryAuth.service')

let getAuthTokenStub

lab.beforeEach((done) => {
  // Stub methods
  getAuthTokenStub = ActiveDirectoryAuthService.prototype.getToken
  ActiveDirectoryAuthService.prototype.getToken = () => {
    return '__GENERATED_CRM_TOKEN__'
  }

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  ActiveDirectoryAuthService.prototype.getToken = getAuthTokenStub

  done()
})

lab.experiment('Default page tests:', () => {
  lab.test('Get / re-directs to the first page in the application flow', (done) => {
    const request = {
      method: 'GET',
      url: '/',
      headers: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/start/start-or-open-saved')

      done()
    })
  })
})
