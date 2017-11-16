'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser

const server = require('../../server')

const Contact = require('../../src/models/contact.model')
const CookieService = require('../../src/services/cookie.service')

let validateCookieStub
let contactListStub
let contactGetByIdStub

const routePath = '/contact-search'

lab.beforeEach(() => {
  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = (request) => true

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
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  Contact.prototype.list = contactListStub
  Contact.prototype.getById = contactGetByIdStub
})

lab.experiment('Contact search page tests:', () => {
  lab.test('The page should have a back link', async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    const element = doc.getElementById('back-link')
    Code.expect(element).to.exist()
  })

  lab.test('GET /contact-search returns the contact search page correctly', async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element = doc.getElementById('page-heading').firstChild
    Code.expect(element.nodeValue).to.equal('Contact search')
  })

  lab.test('POST /contact-search success redirects to contact search page', async () => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        id: '7a8e4354-4f24-e711-80fd-5065f38a1b01'
      }
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal(routePath)
  })

  lab.test('POST /contact-search redirects to error screen when the user token is invalid', async () => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        id: ''
      }
    }

    CookieService.validateCookie = () => {
      return undefined
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal('/error')
  })
})
