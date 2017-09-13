'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser
const server = require('../../server')

lab.beforeEach((done) => {
  done()
})

lab.afterEach((done) => {
  done()
})

lab.experiment('Page Not Found (404) page tests:', () => {
  lab.test('GET /page-not-found returns the 404 page correctly', (done) => {
    const request = {
      method: 'GET',
      url: '/page-not-found',
      headers: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      let element = doc.getElementById('page-not-found-heading').firstChild
      Code.expect(element.nodeValue).to.equal(`We can't find that page`)

      element = doc.getElementById('page-not-found-paragraph').firstChild
      Code.expect(element.nodeValue).to.exist()

      element = doc.getElementById('page-not-found-task-list-link').firstChild
      Code.expect(element.nodeValue).to.exist()

      element = doc.getElementById('page-not-found-apply-link').firstChild
      Code.expect(element.nodeValue).to.exist()

      done()
    })
  })
})
