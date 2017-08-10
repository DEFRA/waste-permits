'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const server = require('../index')

lab.experiment('Site page tests:', () => {
  lab.test('POST /site success redirects to the Task List route', (done) => {
    const request = {
      method: 'POST',
      url: '/site',
      headers: {}
    }

    request.payload = {
      siteName: 'My Site'
    }

    server.methods.validateToken = () => {
      return 'my_token'
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/task-list')

      done()
    })
  })

  lab.test('POST /site redirects to error screen when the user token is invalid', (done) => {
    const request = {
      method: 'POST',
      url: '/site',
      headers: {}
    }

    request.payload = {
      siteName: 'My Site'
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

  lab.test('POST /site shows an error message when the site is invalid', (done) => {
    const request = {
      method: 'POST',
      url: '/site',
      headers: {}
    }
    // request.headers['Set-Cookie'] = 'COOKIE_HERE'

    request.payload = {
      siteName: 'invalid_site_name'
    }

    server.methods.validateToken = () => {
      return 'my_token'
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)
      Code.expect(res.statusCode).to.equal(200)
      done()
    })
  })
})
