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
  lab.test('Get / returns the application home page', (done) => {
    const request = {
      method: 'GET',
      url: '/',
      headers: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      // TODO get the dom parsing test to work
      // const parser = new DOMParser()
      // const doc = parser.parseFromString(res.payload, 'text/html')
      // let element = doc.getElementById('home-page-heading')
      // Code.expect(element.nodeValue).to.equal('Waste Permits Home Page')

      Code.expect(res.payload.includes('home-page-heading')).to.be.true()
      Code.expect(res.payload.includes('Waste Permits Home Page')).to.be.true()

      done()
    })
  })

  lab.test('POST / success redirects to the Start or Open Saved route', (done) => {
    const request = {
      method: 'POST',
      url: '/',
      headers: {},
      payload: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/start/start-or-open-saved')

      done()
    })
  })
})
