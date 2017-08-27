'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
// const DOMParser = require('xmldom').DOMParser
const server = require('../../index')

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
      // let element = doc.getElementById('HOME_PAGE_HEADING')
      // Code.expect(element.nodeValue).to.equal('Waste Permits Home Page')

      Code.expect(res.payload.includes('HOME_PAGE_HEADING')).to.be.true()
      Code.expect(res.payload.includes('Waste Permits Home Page')).to.be.true()

      done()
    })
  })

  lab.test('POST / success redirects to the Site route', (done) => {
    const request = {
      method: 'POST',
      url: '/',
      headers: {},
      payload: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/site')

      done()
    })
  })
})
