'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')

const routePath = '/errors/technical-problem'

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

lab.experiment('Technical Problem page tests:', () => {
  new GeneralTestHelper(lab, routePath).test({
    excludeCookieGetTests: true,
    excludeCookiePostTests: true,
    excludeAlreadySubmittedTest: true})

  lab.test(`GET ${routePath} returns the technical problem page correctly`, async () => {
    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element = doc.getElementById('page-heading').firstChild
    Code.expect(element.nodeValue).to.equal('Something went wrong')

    // Test for the existence of expected static content
    GeneralTestHelper.checkElementsExist(doc, [
      'back-link',
      'paragraph-1',
      'paragraph-2',
      'paragraph-3',
      'paragraph-4'
    ])
  })
})
