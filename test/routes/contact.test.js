'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser
const server = require('../../index')

const Contact = require('../../src/models/contact.model')

let validateTokenStub
let contactListStub
let contactSaveStub

lab.beforeEach((done) => {
  // Stub methods
  validateTokenStub = server.methods.validateToken
  server.methods.validateToken = () => {
    return 'my_token'
  }

  contactListStub = Contact.list
  Contact.list = (crmToken) => {
    return []
  }

  contactSaveStub = Contact.prototype.save
  Contact.prototype.save = (crmToken) => {
  }

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  server.methods.validateToken = validateTokenStub
  Contact.list = contactListStub
  Contact.prototype.save = contactSaveStub

  done()
})

lab.experiment('Contact page tests:', () => {
  lab.test('GET /contact returns the contact page correctly', (done) => {
    const request = {
      method: 'GET',
      url: '/contact',
      headers: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      let element = doc.getElementById('CONTACT_HEADING').firstChild
      Code.expect(element.nodeValue).to.equal('Who should we contact about this application?')

      element = doc.getElementById('CONTACT_CONTINUE').firstChild
      Code.expect(element.nodeValue).to.equal('Continue')

      done()
    })
  })

  lab.test('POST /contact success redirects to the Task List route after a CREATE', (done) => {
    const request = {
      method: 'POST',
      url: '/contact',
      headers: {}
    }

    request.payload = {
      contactName: 'Contact Name',
      contactTelephone: '012345679890',
      contactEmail: 'contact@email.com'
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
      url: '/contact',
      headers: {}
    }

    request.payload = {
      id: '12345',
      contactName: 'Contact Name',
      contactTelephone: '012345679890',
      contactEmail: 'contact@email.com'
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      let element = doc.getElementById('CONTACT_HEADING').firstChild
      Code.expect(element.nodeValue).to.equal('Who should we contact about this application?')

      done()
    })
  })

  lab.test('POST /contact redirects to error screen when the user token is invalid', (done) => {
    const request = {
      method: 'POST',
      url: '/contact',
      headers: {}
    }

    request.payload = {
      siteName: 'My Site'
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
