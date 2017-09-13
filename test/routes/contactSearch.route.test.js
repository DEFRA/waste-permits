'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const server = require('../../index')
const DOMParser = require('xmldom').DOMParser

const Contact = require('../../src/models/contact.model')
const CookieService = require('../../src/services/cookie.service')

let validateCookieStub
let contactListStub
let contactGetByIdStub

lab.beforeEach((done) => {
  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = (cookie) => {
    return true
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

  contactGetByIdStub = Contact.getById
  Contact.getById = (authToken, id) => {
    return new Contact({
      id: '7a8e4354-4f24-e711-80fd-5065f38a1b01',
      firstname: 'Marlon',
      lastname: 'Herzog,',
      telephone1: '01234567890',
      emailaddress1: 'marlon.herzog@example.com'
    })
  }

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  Contact.prototype.list = contactListStub
  Contact.prototype.getById = contactGetByIdStub

  done()
})

lab.experiment('Contact search page tests:', () => {
  lab.test('GET /contact-search returns the contact search page correctly', (done) => {
    const request = {
      method: 'GET',
      url: '/contact-search',
      headers: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      let element = doc.getElementById('contacts-heading').firstChild
      Code.expect(element.nodeValue).to.equal('Contact search')

      done()
    })
  })

  lab.test('POST /contact-search success redirects to contact search page', (done) => {
    const request = {
      method: 'POST',
      url: '/contact-search',
      headers: {},
      payload: {
        id: '7a8e4354-4f24-e711-80fd-5065f38a1b01'
      }
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/contact-search')

      done()
    })
  })

  lab.test('POST /contact-search redirects to error screen when the user token is invalid', (done) => {
    const request = {
      method: 'POST',
      url: '/contact-search',
      headers: {},
      payload: {
        id: ''
      }
    }

    CookieService.validateCookie = () => {
      return undefined
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/error')

      done()
    })
  })
})
