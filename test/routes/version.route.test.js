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

const routePath = '/version'

const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {}
}

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

lab.beforeEach(() => {
  // Stub methods
  generateCookieStub = CookieService.generateCookie
  CookieService.generateCookie = () => fakeCookie

  dynamicSolutionGetStub = DynamicsSolution.get
  DynamicsSolution.get = () => dynamicsVersionInfo
})

lab.afterEach(() => {
  // Restore stubbed methods
  this.generateCookie = generateCookieStub
  DynamicsSolution.get = dynamicSolutionGetStub
})

lab.experiment('Version page tests:', () => {
  lab.test('The page should NOT have a back link', async () => {
    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element = doc.getElementById('back-link')
    Code.expect(element).to.not.exist()
  })

  lab.test(`GET ${routePath} returns the version page correctly`, async () => {
    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element = doc.getElementById('page-heading').firstChild
    Code.expect(element.nodeValue).to.equal('Waste Permits')

    for (let i = 0; i < dynamicsVersionInfo.length; i++) {
      element = doc.getElementById(`dynamics-item-${i}-component-name`).firstChild
      Code.expect(element.nodeValue).to.equal(dynamicsVersionInfo[i].componentName)

      element = doc.getElementById(`dynamics-item-${i}-component-version`).firstChild
      Code.expect(element.nodeValue).to.equal(dynamicsVersionInfo[i].version)
    }
  })
})
