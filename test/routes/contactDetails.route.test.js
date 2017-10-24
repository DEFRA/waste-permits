'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser

const server = require('../../server')

const Contact = require('../../src/models/contact.model')
const CookieService = require('../../src/services/cookie.service')

let validateCookieStub
let contactSaveStub
let contactGetByIdStub

const routePath = '/contact-details'

lab.beforeEach((done) => {
  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = (request) => {
    return true
  }

  contactGetByIdStub = Contact.getById
  Contact.getById = (authToken, id) => {
    return new Contact({
      id: '7a8e4354-4f24-e711-80fd-5065f38a1b01',
      firstname: 'John',
      lastname: 'Smith,',
      telephone1: '01234567890',
      emailaddress1: 'john.smith@email.com'
    })
  }

  contactSaveStub = Contact.prototype.save
  Contact.prototype.save = (authToken) => {
  }
})

lab.afterEach((done) => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  Contact.prototype.getById = contactGetByIdStub
  Contact.prototype.save = contactSaveStub
})

lab.experiment('Contact details page tests:', () => {
  lab.test('The page should have a back link', (done) => {
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

      const element = doc.getElementById('back-link')
      Code.expect(element).to.exist()
    })
  })

  lab.test('GET /contact-details returns the contact page correctly', (done) => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      let element = doc.getElementById('contact-details-heading').firstChild
      Code.expect(element.nodeValue).to.equal('Who should we contact about this application?')

      element = doc.getElementById('contact-details-continue').firstChild
      Code.expect(element.nodeValue).to.equal('Continue')
    })
  })

  lab.test('POST /contact-details success redirects to the Task List route after a CREATE', (done) => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        id: '',
        firstName: 'Marlon',
        lastName: 'Herzog',
        telephone: '055 8767 0835',
        email: 'Amparo.Abbott49@example.com'
      }
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/task-list')
    })
  })

  lab.test('POST /contact-details success stays on the Contact details page after an UPDATE', (done) => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        id: '12345',
        firstName: 'Marlon',
        lastName: 'Herzog',
        telephone: '055 8767 0835',
        email: 'Amparo.Abbott49@example.com'
      }
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      let element = doc.getElementById('contact-details-heading').firstChild
      Code.expect(element.nodeValue).to.equal('Who should we contact about this application?')
    })
  })

  lab.test('POST /contact-details redirects to error screen when the user token is invalid', (done) => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        siteName: 'My Site'
      }
    }

    CookieService.validateCookie = () => {
      return undefined
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/error')
    })
  })
})
