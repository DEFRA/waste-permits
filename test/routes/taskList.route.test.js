'use strict'

const config = require('../../src/config/config')

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser

const server = require('../../server')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')
const CookieService = require('../../src/services/cookie.service')

let generateCookieStub
let validateCookieStub
let dynamicsSearchStub

let routePath = '/task-list'

const fakeCookie = {
  applicationId: 'my_application_id',
  authToken: 'my_auth_token'
}

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

  dynamicsSearchStub = DynamicsDalService.prototype.search
  DynamicsDalService.prototype.search = (query) => {
    // Dynamics StandardRule object
    return {
      '@odata.context': `https://${config.dynamicsWebApiHost}${config.dynamicsWebApiPath}/$metadata#defra_standardrules(defra_rulesnamegovuk,defra_limits,defra_code,defra_wasteparametersId,defra_wasteparametersId(defra_showcostandtime,defra_confirmreadrules,defra_preapprequired,defra_contactdetailsrequired,defra_pholderdetailsrequired,defra_locationrequired,defra_siteplanrequired,defra_techcompetenceevreq,defra_mansystemrequired,defra_fireplanrequired,defra_surfacedrainagereq,defra_cnfconfidentialityreq))`,
      value: [{
        '@odata.etag': 'W/"1234567"',
        defra_rulesnamegovuk: 'Metal recycling, vehicle storage, depollution and dismantling facility',
        defra_limits: 'Less than 25,000 tonnes a year of waste metal and less than 5,000 tonnes a year of waste motor vehicles',
        defra_code: 'SR2015 No 18',
        defra_standardruleid: 'bd610c23-8ba7-e711-810a-5065f38a5b01',
        defra_wasteparametersId: {
          defra_showcostandtime: true,
          defra_confirmreadrules: true,
          defra_preapprequired: true,
          defra_contactdetailsrequired: true,
          defra_pholderdetailsrequired: true,
          defra_locationrequired: true,

          // Turn off the Upload Site Plan section
          defra_siteplanrequired: false,

          defra_techcompetenceevreq: true,
          defra_mansystemrequired: true,
          defra_fireplanrequired: true,
          defra_surfacedrainagereq: true,
          defra_cnfconfidentialityreq: true
        }
      }]
    }
  }

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  CookieService.generateCookie = generateCookieStub
  CookieService.validateCookie = validateCookieStub
  DynamicsDalService.prototype.search = dynamicsSearchStub

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

  lab.test('Task list contains the correct heading and StandardRule info', (done) => {
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

      // Check the existence of the page title and Standard Rule infos
      element = doc.getElementById('task-list-heading')
      Code.expect(element).to.exist()

      element = doc.getElementById('task-list-heading-visually-hidden')
      Code.expect(element).to.exist()

      element = doc.getElementById('standard-rule-name-and-code')
      Code.expect(element).to.exist()

      element = doc.getElementById('select-a-different-permit')
      Code.expect(element).to.exist()

      done()
    })
  })

  lab.test('Task list contains the correct section headings', (done) => {
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

      // Check the existence of the correct task list sections
      element = doc.getElementById('before-you-apply-section-number')
      Code.expect(element).to.exist()
      element = doc.getElementById('before-you-apply-section-heading')
      Code.expect(element).to.exist()

      element = doc.getElementById('prepare-to-apply-section-number')
      Code.expect(element).to.exist()
      element = doc.getElementById('prepare-to-apply-section-heading')
      Code.expect(element).to.exist()

      element = doc.getElementById('complete-application-section-number')
      Code.expect(element).to.exist()
      element = doc.getElementById('complete-application-section-heading')
      Code.expect(element).to.exist()

      element = doc.getElementById('send-and-pay-section-number')
      Code.expect(element).to.exist()
      element = doc.getElementById('send-and-pay-section-heading')
      Code.expect(element).to.exist()

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

      element = doc.getElementById('give-site-name-and-location')
      Code.expect(element).to.exist()
      element = doc.getElementById('give-site-name-and-location-link')
      Code.expect(element).to.exist()

      // Site plan section should not exist
      element = doc.getElementById('upload-the-site-plan')
      Code.expect(element).to.not.exist()
      element = doc.getElementById('upload-the-site-plan-link')
      Code.expect(element).to.not.exist()

      element = doc.getElementById('upload-technical-management-qualifications')
      Code.expect(element).to.exist()
      element = doc.getElementById('upload-technical-management-qualifications-link')
      Code.expect(element).to.exist()

      element = doc.getElementById('tell-us-which-management-system-you-use')
      Code.expect(element).to.exist()
      element = doc.getElementById('tell-us-which-management-system-you-use-link')
      Code.expect(element).to.exist()

      element = doc.getElementById('upload-the-fire-prevention-plan')
      Code.expect(element).to.exist()
      element = doc.getElementById('upload-the-fire-prevention-plan-link')
      Code.expect(element).to.exist()

      element = doc.getElementById('confirm-the-drainage-system-for-the-vehicle-storage-area')
      Code.expect(element).to.exist()
      element = doc.getElementById('confirm-the-drainage-system-for-the-vehicle-storage-area-link')
      Code.expect(element).to.exist()

      element = doc.getElementById('confirm-confidentiality-needs')
      Code.expect(element).to.exist()
      element = doc.getElementById('confirm-confidentiality-needs-link')
      Code.expect(element).to.exist()

      element = doc.getElementById('submit-pay')
      Code.expect(element).to.exist()
      element = doc.getElementById('submit-pay-link')
      Code.expect(element).to.exist()

      done()
    })
  })

  // Completeness flags are not in scope yet
  // lab.test('Task list items have the correct completeness flags', (done) => {
  //   const request = {
  //     method: 'GET',
  //     url: routePath,
  //     headers: {},
  //     payload: {}
  //   }
  //
  //   server.inject(request, (res) => {
  //     Code.expect(res.statusCode).to.equal(200)
  //
  //     const parser = new DOMParser()
  //     const doc = parser.parseFromString(res.payload, 'text/html')
  //
  //     let element
  //
  //     // Check completed flags on task list items
  //     element = doc.getElementById('cost-and-time-completed')
  //     Code.expect(element).to.exist()
  //     element = doc.getElementById('operation-rules-completed')
  //     Code.expect(element).to.not.exist()
  //     element = doc.getElementById('preapp-completed')
  //     Code.expect(element).to.exist()
  //     element = doc.getElementById('contact-details-completed')
  //     Code.expect(element).to.not.exist()
  //     element = doc.getElementById('site-operator-completed')
  //     Code.expect(element).to.exist()
  //
  //     done()
  //   })
  // })

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
