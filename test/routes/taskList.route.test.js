'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const server = require('../../index')

let validateCookieStub

lab.beforeEach((done) => {
  // Stub methods
  validateCookieStub = server.methods.validateCookie
  server.methods.validateCookie = (cookie) => {
    return true
  }

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  server.methods.validateCookie = validateCookieStub

  done()
})

lab.experiment('Task List page tests:', () => {
  lab.test('GET /task-list success ', (done) => {
    const request = {
      method: 'GET',
      url: '/task-list',
      headers: {},
      payload: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)
      done()
    })
  })

  lab.test('GET /task-list redirects to error screen when the user token is invalid', (done) => {
    const request = {
      method: 'GET',
      url: '/task-list',
      headers: {},
      payload: {}
    }

    server.methods.validateCookie = () => {
      return undefined
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/error')
      done()
    })
  })
})
