'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const server = require('../../index')

// const DOMParser = require('xmldom').DOMParser

// let validateTokenStub

lab.beforeEach((done) => {
  // Stub methods
  // validateTokenStub = server.methods.validateToken
  // server.methods.validateToken = () => {
  //   return 'my_token'
  // }

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  // server.methods.validateToken = validateTokenStub

  done()
})

lab.experiment('Version page tests:', () => {
  lab.test('GET /version returns the version page correctly', (done) => {
    const request = {
      method: 'GET',
      url: '/version',
      headers: {}
    }

    server.inject(request, (res) => {
      console.log('resp=', res)

      Code.expect(res.statusCode).to.equal(200)

      // const parser = new DOMParser()
      // const doc = parser.parseFromString(res.payload, 'text/html')
      //
      // let element = doc.getElementById('site-heading').firstChild
      // Code.expect(element.nodeValue).to.equal('What\'s the site name?')
      //
      // element = doc.getElementById('site-name-label').firstChild
      // Code.expect(element.nodeValue).to.equal('Site name')
      //
      // element = doc.getElementById('site-submit').firstChild
      // Code.expect(element.nodeValue).to.equal('Continue')

      done()
    })
  })
})
