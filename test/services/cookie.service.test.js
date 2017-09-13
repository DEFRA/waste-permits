'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const CookieService = require('../../src/services/cookie.service')

lab.beforeEach((done) => {
  done()
})

lab.afterEach((done) => {
  done()
})

lab.experiment('Cookie Service methods:', () => {
  lab.test('Validate cookie should successfully validate a valid cookie', (done) => {
    const cookie = {
      applicationId: 'my_application_od',
      authToken: 'my_crm_token'
    }

    Code.expect(CookieService.validateCookie(cookie)).to.be.true()
    done()
  })

  lab.test('Validate cookie should successfully validate a missing cookie', (done) => {
    try {
      CookieService.validateCookie(undefined)
    } catch (error) {
      Code.expect(error).to.be.an.instanceof(Error)
      Code.expect(error.message).to.equal('Unable to validate undefined cookie')
      done()
    }
  })

  lab.test('Validate cookie should successfully validate an invalid cookie', (done) => {
    const cookie = {
      applicationId: '',
      authToken: 'my_crm_token'
    }

    Code.expect(CookieService.validateCookie(cookie)).to.be.false()
    done()
  })
})
