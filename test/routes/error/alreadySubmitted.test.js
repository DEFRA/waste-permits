'use strict'
'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')

const Application = require('../../../src/models/application.model')
const CookieService = require('../../../src/services/cookie.service')
const {COOKIE_RESULT} = require('../../../src/constants')

let validateCookieStub
const routePath = '/errors/order/done-cant-go-back'
const pageHeading = `You’ve sent your application so you can't go back and change it`

let applicationGetByIdStub

const fakeApplicationData = {
  id: 'APPLICATION_ID',
  accountId: 'ACCOUNT_ID',
  tradingName: 'THE TRADING NAME',
  applicationNumber: 'APPLICATION_REFERENCE'
}

const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {},
  payload: {}
}

lab.beforeEach(() => {
  // Stub methods

  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => COOKIE_RESULT.VALID_COOKIE

  applicationGetByIdStub = Application.getById
  Application.getById = () => new Application(fakeApplicationData)
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  Application.getById = applicationGetByIdStub
})

lab.experiment('Already Submitted page tests:', () => {
  new GeneralTestHelper(lab, routePath).test(false, true)

  lab.test('The page should NOT have a back link', async () => {
    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element = doc.getElementById('back-link')
    Code.expect(element).to.not.exist()
  })

  lab.test(`GET ${routePath} returns the Already Submitted page correctly`, async () => {
    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element = doc.getElementById('page-heading').firstChild
    Code.expect(element.nodeValue).to.equal(pageHeading)

    const elementIds = [
      'paragraph-1',
      'paragraph-2',
      'paragraph-3',
      'paragraph-4',
      'psc-email',
      'application-reference',
      'start-new-application-link'
    ]
    for (let id of elementIds) {
      element = doc.getElementById(id)
      Code.expect(doc.getElementById(id)).to.exist()
    }

    // Ensure that the application reference is being displayed correctly
    element = doc.getElementById('application-reference')
    Code.expect(element.textContent).to.equal(fakeApplicationData.applicationNumber)
  })
})
