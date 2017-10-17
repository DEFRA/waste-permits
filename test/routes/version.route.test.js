'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser

const server = require('../../server')
const DynamicsSolution = require('../../src/models/dynamicsSolution.model')
const CookieService = require('../../src/services/cookie.service')

let generateCookieStub
let dynamicSolutionGetStub

let routePath = '/version'

// Test data
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

const fakeCookie = {
  applicationId: 'my_application_id',
  authToken: 'my_auth_token'
}

lab.beforeEach((done) => {
  // Stub methods
  generateCookieStub = CookieService.generateCookie
  CookieService.generateCookie = (reply) => {
    return fakeCookie
  }

  dynamicSolutionGetStub = DynamicsSolution.get
  DynamicsSolution.get = (authToken) => {
    return dynamicsVersionInfo
  }

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  this.generateCookie = generateCookieStub
  DynamicsSolution.get = dynamicSolutionGetStub

  done()
})

lab.experiment('Version page tests:', () => {
  lab.test('The page should NOT have a back link', (done) => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      let element = doc.getElementById('back-link')
      Code.expect(element).to.not.exist()

      done()
    })
  })

  lab.test('GET /version returns the version page correctly', (done) => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      let element = doc.getElementById('version-heading').firstChild
      Code.expect(element.nodeValue).to.equal('Waste Permits')

      for (let i = 0; i < dynamicsVersionInfo.length; i++) {
        element = doc.getElementById(`dynamics-item-${i}-component-name`).firstChild
        Code.expect(element.nodeValue).to.equal(dynamicsVersionInfo[i].componentName)

        element = doc.getElementById(`dynamics-item-${i}-component-version`).firstChild
        Code.expect(element.nodeValue).to.equal(dynamicsVersionInfo[i].version)
      }
      done()
    })
  })
})
