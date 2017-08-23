'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const server = require('../index')

lab.experiment('Server methods:', () => {
  lab.test('Validate token', (done) => {
    const cookie = {
      token: 'my_token'
    }

    Code.expect(server.methods.validateToken(cookie)).to.equal(cookie.token)
    done()
  })
})
