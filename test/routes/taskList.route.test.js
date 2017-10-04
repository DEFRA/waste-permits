'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser

const server = require('../../server')
const StandardRule = require('../../src/models/standardRule.model')
const CookieService = require('../../src/services/cookie.service')

let generateCookieStub
let validateCookieStub
let standardRuleGetByCodeStub

let routePath = '/task-list'

const fakeCookie = {
  applicationId: 'my_application_id',
  authToken: 'my_auth_token'
}

// const fakeData = {
//   'SR2015 No 18': [{
//     sectionIndex: 1,
//     sectionName: 'Before you apply',
//     listItems: [{
//       id: 'check-permit-cost-and-time',
//       label: 'LABEL_1',
//       href: 'HREF_1',
//       completedLabelId: 'cost-and-time-completed',
//       complete: true
//     }, {
//       id: 'confirm-that-your-operation-meets-the-rules',
//       label: 'LABEL_2',
//       href: 'HREF_2',
//       completedLabelId: 'operation-rules-completed',
//       complete: false
//     }]
//   }, {
//     sectionIndex: 2,
//     sectionName: 'Prepare to apply',
//     listItems: [{
//       id: 'tell-us-if-youve-discussed-this-application-with-us',
//       label: 'LABEL_3',
//       href: 'HREF_3',
//       completedLabelId: 'preapp-completed',
//       complete: true
//     }]
//   }, {
//     sectionIndex: 3,
//     sectionName: 'Complete application',
//     listItems: [{
//       id: 'give-contact-details',
//       label: 'LABEL_4',
//       href: 'HREF_4',
//       completedLabelId: 'contact-details-completed',
//       complete: false
//     }, {
//       id: 'give-permit-holder-details',
//       label: 'LABEL_5',
//       href: 'HREF_5',
//       completedLabelId: 'site-operator-completed',
//       complete: true
//     }]
//   }]
// }

lab.beforeEach((done) => {
  // Stub methods
  generateCookieStub = CookieService.generateCookie
  CookieService.generateCookie = (reply) => {
    return fakeCookie
  }

  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = (cookie) => {
    return true
  }

  standardRuleGetByCodeStub = StandardRule.getByCode
  StandardRule.getByCode = (authToken, code) => {
    return {
      name: 'Metal recycling, vehicle storage, depollution and dismantling facility',
      limits: 'Less than 25,000 tonnes a year of waste metal and less than 5,000 tonnes a year of waste motor vehicles',
      code: 'SR2015 No 18',
      codeForId: 'sr2015-no-18'
    }
  }

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  CookieService.generateCookie = generateCookieStub
  CookieService.validateCookie = validateCookieStub
  StandardRule.prototype.getByCode = standardRuleGetByCodeStub

  done()
})

lab.experiment('Task List page tests:', () => {
  lab.test('GET /task-list success ', (done) => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)
      done()
    })
  })

  lab.test('Task list contains the correct task list items', (done) => {
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

      let element

      // Check existence of task list items
      element = doc.getElementById('check-permit-cost-and-time')
      Code.expect(element).to.exist()
      element = doc.getElementById('check-permit-cost-and-time-link')
      Code.expect(element).to.exist()

      element = doc.getElementById('confirm-that-your-operation-meets-the-rules')
      Code.expect(element).to.exist()
      element = doc.getElementById('confirm-that-your-operation-meets-the-rules-link')
      Code.expect(element).to.exist()

      element = doc.getElementById('tell-us-if-youve-discussed-this-application-with-us')
      Code.expect(element).to.exist()
      element = doc.getElementById('tell-us-if-youve-discussed-this-application-with-us-link')
      Code.expect(element).to.exist()

      element = doc.getElementById('give-contact-details')
      Code.expect(element).to.exist()
      element = doc.getElementById('give-contact-details-link')
      Code.expect(element).to.exist()

      element = doc.getElementById('give-permit-holder-details')
      Code.expect(element).to.exist()
      element = doc.getElementById('give-permit-holder-details-link')
      Code.expect(element).to.exist()

      // Check completed flags on task list items
      element = doc.getElementById('cost-and-time-completed')
      Code.expect(element).to.exist()
      element = doc.getElementById('operation-rules-completed')
      Code.expect(element).to.not.exist()
      element = doc.getElementById('preapp-completed')
      Code.expect(element).to.exist()
      element = doc.getElementById('contact-details-completed')
      Code.expect(element).to.not.exist()
      element = doc.getElementById('site-operator-completed')
      Code.expect(element).to.exist()

      done()
    })
  })

  lab.test('GET /task-list redirects to error screen when the user token is invalid', (done) => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
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
