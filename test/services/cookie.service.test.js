'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

const Constants = require('../../src/constants')
const ActiveDirectoryAuthService = require('../../src/services/activeDirectoryAuth.service')
const CookieService = require('../../src/services/cookie.service')
const {COOKIE_RESULT} = require('../../src/constants')

let fakeRequest
let authServiceGetTokenStub

lab.beforeEach(() => {
  authServiceGetTokenStub = ActiveDirectoryAuthService.prototype.getToken
  ActiveDirectoryAuthService.prototype.getToken = () => {}

  fakeRequest = {
    path: '/some/path',
    state: {
      [Constants.DEFRA_COOKIE_KEY]: {
        [Constants.COOKIE_KEY.APPLICATION_ID]: 'my_application_id',
        [Constants.COOKIE_KEY.AUTH_TOKEN]: 'my_crm_token',
        [Constants.COOKIE_KEY.EXPIRY]: Date.now() + 10000
      }
    },

    log: (token, message) => {}
  }
})

lab.afterEach(() => {
  ActiveDirectoryAuthService.prototype.getToken = authServiceGetTokenStub
})

lab.experiment('Cookie Service tests:', () => {
  lab.test('Validate cookie should successfully validate a valid cookie', async () => {
    Code.expect(await CookieService.validateCookie(fakeRequest)).to.equal(COOKIE_RESULT.VALID_COOKIE)
  })

  lab.test('Validate cookie method should detect a missing cookie', async () => {
    delete fakeRequest.state.DefraSession
    Code.expect(await CookieService.validateCookie(fakeRequest)).to.equal(COOKIE_RESULT.COOKIE_NOT_FOUND)
  })

  lab.test('Validate cookie method should detect when the cookie has expired', async () => {
    fakeRequest.state.DefraSession.expiry = Date.now() - 1
    Code.expect(await CookieService.validateCookie(fakeRequest)).to.equal(COOKIE_RESULT.COOKIE_EXPIRED)
  })

  lab.test('Validate cookie method should detect when the ApplicationID does not exist', async () => {
    delete fakeRequest.state.DefraSession.applicationId
    Code.expect(await CookieService.validateCookie(fakeRequest)).to.equal(COOKIE_RESULT.APPLICATION_NOT_FOUND)
  })

  lab.test('Get method should successfully retrieve a value from the cookie', () => {
    Code.expect(CookieService.get(fakeRequest, Constants.COOKIE_KEY.AUTH_TOKEN)).to.equal(fakeRequest.state[Constants.DEFRA_COOKIE_KEY][Constants.COOKIE_KEY.AUTH_TOKEN])
  })

  lab.test('Set method should successfully mutate a value in the cookie', () => {
    const expectedValue = 'MY_NEW_VALUE'
    CookieService.set(fakeRequest, Constants.COOKIE_KEY.AUTH_TOKEN, expectedValue)
    Code.expect(CookieService.get(fakeRequest, Constants.COOKIE_KEY.AUTH_TOKEN)).to.equal(expectedValue)
  })
})
