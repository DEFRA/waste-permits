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

lab.beforeEach(() => {
  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => true

  contactGetByIdStub = Contact.getById
  Contact.getById = (authToken, id) => {
    return new Contact({
      id: '7a8e4354-4f24-e711-80fd-5065f38a1b01',
      firstName: 'John',
      lastName: 'Smith,',
      telephone: '01234567890',
      email: 'john.smith@email.com',
      dob: {
        day: 1,
        month: 1,
        year: 1970
      }
    })
  }

  contactSaveStub = Contact.prototype.save
  Contact.prototype.save = () => {}
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  Contact.prototype.getById = contactGetByIdStub
  Contact.prototype.save = contactSaveStub
})

lab.experiment('Contact details page tests:', () => {
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

  lab.test('GET /contact-details returns the contact page correctly', async () => {
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
    Code.expect(element.nodeValue).to.equal('Who should we contact about this application?')

    element = doc.getElementById('submit-button').firstChild
    Code.expect(element.nodeValue).to.equal('Continue')
  })

  lab.test('POST /contact-details success redirects to the Task List route after a CREATE', async () => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        id: '',
        firstName: 'Marlon',
        lastName: 'Herzog',
        telephone: '055 8767 0835',
        email: 'Amparo.Abbott49@example.com',
        dob: {
          day: 1,
          month: 1,
          year: 1970
        }
      }
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal('/task-list')
  })

  lab.test('POST /contact-details success stays on the Contact details page after an UPDATE', async () => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        id: '12345',
        firstName: 'Marlon',
        lastName: 'Herzog',
        telephone: '055 8767 0835',
        email: 'Amparo.Abbott49@example.com',
        dob: {
          day: 1,
          month: 1,
          year: 1970
        }
      }
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element = doc.getElementById('page-heading').firstChild
    Code.expect(element.nodeValue).to.equal('Who should we contact about this application?')
  })

  lab.test('POST /contact-details redirects to error screen when the user token is invalid', async () => {
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

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal('/error')
  })
})
