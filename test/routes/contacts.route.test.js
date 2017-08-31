'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const server = require('../../index')
const DOMParser = require('xmldom').DOMParser

const Contact = require('../../src/models/contact.model')

let validateTokenStub
let contactListStub

lab.beforeEach((done) => {
  // Stub methods
  validateTokenStub = server.methods.validateTokenStub
  server.methods.validateToken = () => {
    return 'my_token'
  }

  contactListStub = Contact.list
  Contact.list = (authToken) => {
    return {
      count: 3,
      results: [
        { id: '7a8e4354-4f24-e711-80fd-5065f38a1b01',
          firstName: 'Marlon',
          lastName: 'Herzog',
          telephone: '055 8767 0835',
          email: 'Amparo.Abbott49@example.com' },
        { id: '8e8e4354-4f24-e711-80fd-5065f38a1b01',
          firstName: 'Kelvin',
          lastName: 'Rice',
          telephone: '055 8301 2280',
          email: 'Mike9@example.com' },
        { id: '9d8e4354-4f24-e711-80fd-5065f38a1b01',
          firstName: 'Maximo',
          lastName: 'Wisoky',
          telephone: '01424 733336',
          email: 'Danielle.Howell@example.com'
        }
      ]
    }
  }

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  server.methods.validateToken = validateTokenStub
  Contact.prototype.list = contactListStub

  done()
})

lab.experiment('Contacts page tests:', () => {
  lab.test('GET /search returns the contacts page correctly', (done) => {
    const request = {
      method: 'GET',
      url: '/search',
      headers: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      let element = doc.getElementById('contacts-heading').firstChild
      Code.expect(element.nodeValue).to.equal('Contacts')

      done()
    })
  })

  lab.test('POST /search redirects to error screen when the user token is invalid', (done) => {
    const request = {
      method: 'POST',
      url: '/search',
      headers: {},
      payload: {
        id: ''
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
})
