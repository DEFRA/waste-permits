'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser
const server = require('../../server')

const routePath = '/error'

lab.beforeEach((done) => {

})

lab.afterEach((done) => {

})

lab.experiment('Error page tests:', () => {
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
    })
  })

  lab.test('GET /error returns the error page correctly', (done) => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      let element = doc.getElementById('error-heading').firstChild
      Code.expect(element.nodeValue).to.equal('Something went wrong')
    })
  })
})
