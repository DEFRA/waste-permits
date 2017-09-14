'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const CookieService = require('../../src/services/cookie.service')

let fakeRequest
let logStub

lab.beforeEach((done) => {
  fakeRequest = {
    path: '/some/path',
    state: {
      DefraSession: {
        applicationId: 'my_application_id',
        authToken: 'my_crm_token'
      }
    },

    log: (token, message) => {}
  }

  done()
})

lab.afterEach((done) => {
  done()
})

lab.experiment('Cookie Service methods:', () => {
  lab.test('Validate cookie should successfully validate a valid cookie', (done) => {
    Code.expect(CookieService.validateCookie(fakeRequest)).to.be.true()
    done()
  })

  lab.test('Validate cookie should successfully validate a missing cookie', (done) => {
    fakeRequest.state = {}
    CookieService.validateCookie(fakeRequest)
    Code.expect(CookieService.validateCookie(fakeRequest)).to.be.false()
    done()
  })

  lab.test('Validate cookie should successfully validate an invalid cookie', (done) => {
    fakeRequest.state.DefraSession.applicationId = undefined
    Code.expect(CookieService.validateCookie(fakeRequest)).to.be.false()

    fakeRequest.state.DefraSession.applicationId = ''
    Code.expect(CookieService.validateCookie(fakeRequest)).to.be.false()
    done()
  })
})
