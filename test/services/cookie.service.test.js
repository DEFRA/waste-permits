'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

const CookieService = require('../../src/services/cookie.service')

let fakeRequest

lab.beforeEach(() => {
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
})

lab.afterEach(() => {})

lab.experiment('Cookie Service tests:', () => {
  lab.test('Validate cookie should successfully validate a valid cookie', () => {
    Code.expect(CookieService.validateCookie(fakeRequest)).to.be.true()
  })

  lab.test('Validate cookie should successfully validate a missing cookie', () => {
    fakeRequest.state = {}
    CookieService.validateCookie(fakeRequest)
    Code.expect(CookieService.validateCookie(fakeRequest)).to.be.false()
  })

  lab.test('Validate cookie should successfully validate an invalid cookie', () => {
    fakeRequest.state.DefraSession.applicationId = undefined
    Code.expect(CookieService.validateCookie(fakeRequest)).to.be.false()

    fakeRequest.state.DefraSession.applicationId = ''
    Code.expect(CookieService.validateCookie(fakeRequest)).to.be.false()
  })
})
