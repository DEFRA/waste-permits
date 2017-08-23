'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const server = require('../../index')

const DOMParser = require('xmldom').DOMParser

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

lab.experiment('Site page tests:', () => {
  lab.test('GET /site returns the site page correctly', (done) => {
    const request = {
      method: 'GET',
      url: '/site',
      headers: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      // console.log(res.payload)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      let element = doc.getElementById('SITE_HEADING').firstChild
      Code.expect(element.nodeValue).to.equal('What\'s the site name?')

      element = doc.getElementById('SITE_NAME_LABEL').firstChild
      Code.expect(element.nodeValue).to.equal('Site name')

      element = doc.getElementById('SITE_SUBMIT').firstChild
      Code.expect(element.nodeValue).to.equal('Continue')

      done()
    })
  })

  lab.test('POST /site success redirects to the Contact route', (done) => {
    const request = {
      method: 'POST',
      url: '/site',
      headers: {},
      payload: {
        siteName: 'My Site'
      }
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/contact')

      done()
    })
  })

  lab.test('POST /site redirects to error screen when the user token is invalid', (done) => {
    const request = {
      method: 'POST',
      url: '/site',
      headers: {},
      payload: {
        siteName: 'My Site'
      }
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
      headers: {},
      payload: {
        siteName: 'invalid_site_name'
      }
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      const element = doc.getElementById('SITE_ERROR').firstChild
      Code.expect(element.nodeValue).to.equal('ERROR: Invalid site name: [invalid_site_name]')

      done()
    })
  })
})
