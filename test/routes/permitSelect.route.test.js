'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')

let validateCookieStub

lab.beforeEach((done) => {
  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => {
    return true
  }

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub

  done()
})

lab.experiment('Select a permit page tests:', () => {
  lab.test('GET /permit/select returns the permit selection page correctly', (done) => {
    const request = {
      method: 'GET',
      url: '/permit/select',
      headers: {},
      payload: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      let element = doc.getElementById('permit-select-heading').firstChild
      Code.expect(element.nodeValue).to.equal('Select a permit')

      element = doc.getElementById('chosen-permit-id-36-name').firstChild
      Code.expect(element.nodeValue).to.include('Metal recycling, vehicle storage, depollution and dismantling facility')

      element = doc.getElementById('chosen-permit-id-36-weight').firstChild
      Code.expect(element.nodeValue).to.include('Less than 25,000 tonnes a year of waste metal and less than 5,000 tonnes a year of waste motor vehicles')

      element = doc.getElementById('chosen-permit-id-36-code').firstChild
      Code.expect(element.nodeValue).to.equal('SR2015 No 18')

      element = doc.getElementById('permit-select-submit').firstChild
      Code.expect(element.nodeValue).to.equal('Continue')

      done()
    })
  })

  lab.test('POST /permit/select success redirects to the task list route', (done) => {
    const request = {
      method: 'POST',
      url: '/permit/select',
      headers: {},
      payload: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/task-list')

      done()
    })
  })

  lab.test('GET /permit/select redirects to error screen when the user token is invalid', (done) => {
    const request = {
      method: 'GET',
      url: '/permit/select',
      headers: {},
      payload: {}
    }

    CookieService.validateCookie = () => {
      return undefined
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/error')
      done()
    })
  })
})
