'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

const StandardRule = require('../../src/models/standardRule.model')


let validateCookieStub
let standardRuleListStub
let dynamicsSearchStub
let dynamicsCreateStub

const routePath = '/permit/select'

lab.beforeEach((done) => {
  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => {
    return true
  }

  standardRuleListStub = StandardRule.list
  StandardRule.list = (authToken) => {
    return {
      count: 1,
      results: [{
        id: 'bd610c23-8ba7-e711-810a-5065f38a5b01',
        name: 'Metal recycling, vehicle storage, depollution and dismantling facility',
        limits: 'Less than 25,000 tonnes a year of waste metal and less than 5,000 tonnes a year of waste motor vehicles',
        code: 'SR2015 No 18',
        codeForId: 'sr2015-no-18'
      }]
    }
  }

  dynamicsSearchStub = DynamicsDalService.prototype.search
  DynamicsDalService.prototype.search = (query) => {
    // Dynamics StandardRule object
    return {
      '@odata.context': 'THE_ODATA_ENDPOINT_AND_QUERY',
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

  dynamicsCreateStub = DynamicsDalService.prototype.create
  DynamicsDalService.prototype.create = (dataObject, query) => {
    return '7a8e4354-4f24-e711-80fd-5065f38a1b01'
  }

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  StandardRule.prototype.list = standardRuleListStub
  DynamicsDalService.prototype.search = dynamicsSearchStub
  DynamicsDalService.prototype.create = dynamicsCreateStub

  done()
})

lab.experiment('Select a permit page tests:', () => {
  lab.test('The page should NOT have a back link', (done) => {
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
      Code.expect(element).to.not.exist()

      done()
    })
  })

  lab.test('GET /permit/select returns the permit selection page correctly', (done) => {
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

      let element = doc.getElementById('permit-select-heading').firstChild
      Code.expect(element.nodeValue).to.equal('Select a permit')

      element = doc.getElementById('chosen-permit-sr2015-no-18-name').firstChild
      Code.expect(element.nodeValue).to.include('Metal recycling, vehicle storage, depollution and dismantling facility')

      element = doc.getElementById('chosen-permit-sr2015-no-18-weight').firstChild
      Code.expect(element.nodeValue).to.include('Less than 25,000 tonnes a year of waste metal and less than 5,000 tonnes a year of waste motor vehicles')

      element = doc.getElementById('chosen-permit-sr2015-no-18-code').firstChild
      Code.expect(element.nodeValue).to.equal('SR2015 No 18')

      element = doc.getElementById('permit-select-submit').firstChild
      Code.expect(element.nodeValue).to.equal('Continue')

      done()
    })
  })

  lab.test('POST /permit/select success redirects to the task list route', (done) => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        'chosen-permit': 'SR2015 No 18'
      }
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/task-list')

      done()
    })
  })

  lab.test('GET /permit/select redirects to error screen when the user token is invalid', (done) => {
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

  lab.test('POST /permit/select shows the error message summary panel when the site data is invalid', (done) => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        'chosen-permit': ''
      }
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      const element = doc.getElementById('error-summary')

      Code.expect(element).to.exist()

      done()
    })
  })

  lab.test('POST /permit/select shows an error message when no permit is selected', (done) => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      let element
      let errorMessage = 'Select the permit you want'

      // Panel summary error item
      element = doc.getElementById('error-summary-list-item-0').firstChild
      Code.expect(element.nodeValue).to.equal(errorMessage)

      // Chosen permit ID error
      element = doc.getElementById('chosen-permit-error').firstChild
      Code.expect(element.nodeValue).to.equal(errorMessage)

      done()
    })
  })

  lab.test('POST /permit/select shows an error message when the permit value is not allowed', (done) => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        'chosen-permit': 'not a real permit'
      }
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      let element
      let errorMessage = 'Select a valid permit'

      // Panel summary error item
      element = doc.getElementById('error-summary-list-item-0').firstChild
      Code.expect(element.nodeValue).to.equal(errorMessage)

      // Chosen permit ID error
      element = doc.getElementById('chosen-permit-error').firstChild
      Code.expect(element.nodeValue).to.equal(errorMessage)

      done()
    })
  })
})
