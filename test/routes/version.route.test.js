'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const server = require('../../index')

const DynamicsSolution = require('../../src/models/dynamicsSolution.model')

const DOMParser = require('xmldom').DOMParser

let validateTokenStub
let dynamicSolutionGetStub

lab.beforeEach((done) => {
  // Stub methods
  validateTokenStub = server.methods.validateToken
  server.methods.validateToken = () => {
    return 'my_token'
  }

  const dynamicsVersionInfo = [{
    componentName: 'FIRST_COMPONENT',
    version: '1.2.3'
  }, {
    componentName: 'SECOND_COMPONENT',
    version: '4.5.6'
  }, {
    componentName: 'THIRD_COMPONENT',
    version: '7.8.9'
  }]

  dynamicSolutionGetStub = DynamicsSolution.get
  DynamicsSolution.get = (authToken) => {
    return dynamicsVersionInfo
  }

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  server.methods.validateToken = validateTokenStub

  DynamicsSolution.get = dynamicSolutionGetStub

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
      console.log('resp=', res.payload)

      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      let element = doc.getElementById('version-heading').firstChild
      Code.expect(element.nodeValue).to.equal('Waste Permits')

      // element = doc.getElementById('site-name-label').firstChild
      // Code.expect(element.nodeValue).to.equal('Site name')
      //
      // element = doc.getElementById('site-submit').firstChild
      // Code.expect(element.nodeValue).to.equal('Continue')

      done()
    })
  })
})
