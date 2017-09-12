'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const server = require('../index')

lab.beforeEach((done) => {
  done()
})

lab.afterEach((done) => {
  done()
})

lab.experiment('Server methods:', () => {
  lab.test('Validate token', (done) => {
    const cookie = {
      applicationId: 'my_token',
      authToken: 'my_crm_token'
    }

    Code.expect(server.methods.validateCookie(cookie)).to.be.true
    done()
  })
})
