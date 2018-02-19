'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

const CookieService = require('../../src/services/cookie.service')

let fakeRequest
// let dateNowStub = Date.now

lab.beforeEach(() => {
  // Date.now = () => 1500

  fakeRequest = {
    path: '/some/path',
    state: {
      DefraSession: {
        applicationId: 'my_application_id',
        authToken: 'my_crm_token',
        expiry: Date.now() + 10000
      }
    },

    log: (token, message) => {}
  }
})

lab.afterEach(() => {
  // Date.now = dateNowStub
})

lab.experiment('Cookie Service tests:', () => {
  lab.experiment('Success:', () => {
    lab.test('Validate cookie should successfully validate a valid cookie', async () => {
      Code.expect(await CookieService.validateCookie(fakeRequest)).to.be.true()

    })
  })

  lab.experiment('Failure:', () => {
    lab.test('Validate cookie method should detect a missing cookie', async () => {

    })

    lab.test('Validate cookie method should detect an expired cookie', async () => {

    })
  })


  lab.test('Validate cookie should successfully validate a missing cookie', async () => {
    fakeRequest.state = {}
    CookieService.validateCookie(fakeRequest)
    Code.expect(await CookieService.validateCookie(fakeRequest)).to.be.false()
  })

  lab.test('Validate cookie should successfully validate an invalid cookie', async () => {
    fakeRequest.state.DefraSession.applicationId = undefined
    Code.expect(await CookieService.validateCookie(fakeRequest)).to.be.false()

    fakeRequest.state.DefraSession.applicationId = ''
    Code.expect(await CookieService.validateCookie(fakeRequest)).to.be.false()
  })
})
