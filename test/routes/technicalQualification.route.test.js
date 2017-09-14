'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const server = require('../../server')

let validateTokenStub

lab.beforeEach((done) => {
  // Stub methods
  validateTokenStub = server.methods.validateToken
  server.methods.validateToken = () => {
    return 'my_token'
  }

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  server.methods.validateToken = validateTokenStub

  done()
})

lab.experiment('Which qualification does the person providing technical management have? page tests:', () => {
  lab.test('GET /technical-qualification success ', (done) => {
    const request = {
      method: 'GET',
      url: '/technical-qualification',
      headers: {},
      payload: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)
      done()
    })
  })

  lab.test('GET /technical-qualification redirects to error screen when the user token is invalid', (done) => {
    const request = {
      method: 'GET',
      url: '/technical-qualification',
      headers: {},
      payload: {}
    }

    server.methods.validateToken = () => {
      return undefined
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/error')
      done()
    })
  })
})
