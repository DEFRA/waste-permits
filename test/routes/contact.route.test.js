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

let routePath = '/contact'

lab.beforeEach((done) => {
  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = (cookie) => {
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

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  Contact.prototype.getById = contactGetByIdStub
  Contact.prototype.save = contactSaveStub

  done()
})

lab.experiment('Contact page tests:', () => {
  lab.test('GET /contact returns the contact page correctly', (done) => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      let element = doc.getElementById('contact-heading').firstChild
      Code.expect(element.nodeValue).to.equal('Who should we contact about this application?')

      element = doc.getElementById('contact-continue').firstChild
      Code.expect(element.nodeValue).to.equal('Continue')

      done()
    })
  })

  lab.test('POST /contact success redirects to the Task List route after a CREATE', (done) => {
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

      done()
    })
  })

  lab.test('POST /contact success stays on the Contact page after an UPDATE', (done) => {
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

      let element = doc.getElementById('contact-heading').firstChild
      Code.expect(element.nodeValue).to.equal('Who should we contact about this application?')

      done()
    })
  })

  lab.test('POST /contact redirects to error screen when the user token is invalid', (done) => {
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

      done()
    })
  })
})
