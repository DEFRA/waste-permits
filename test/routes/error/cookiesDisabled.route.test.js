'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser
const server = require('../../../server')

const routePath = '/errors/cookies-off'
const pageHeading = 'You must switch on cookies to use this service'

const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {},
  payload: {}
}

lab.beforeEach(() => {

})

lab.afterEach(() => {

})

lab.experiment('Cookies Disabled page tests:', () => {
  lab.test(`GET ${routePath} returns the disabled cookies page correctly`, async () => {
    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element = doc.getElementById('page-heading').firstChild
    Code.expect(element.nodeValue).to.equal(pageHeading)

    const elementIds = [
      'paragraph-1',
      'paragraph-2',
      'paragraph-3',
      'ico-link',
      'cookie-list-link'
    ]
    for (let id of elementIds) {
      element = doc.getElementById(id)
      Code.expect(doc.getElementById(id)).to.exist()
    }
  })
})
