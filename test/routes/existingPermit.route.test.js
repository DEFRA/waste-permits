'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const CookieService = require('../../src/services/cookie.service')
const RecoveryService = require('../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../src/constants')

const routePath = '/existing-permit'
const nextRoutePathYes = '/existing-permit/yes'
const nextRoutePathNo = '/task-list'

lab.experiment('Existing permit page tests:', () => {
  let mocks
  let sandbox

  lab.beforeEach(() => {
    mocks = new Mocks()
    sandbox = sinon.createSandbox()
    sandbox.stub(Application, 'getById').value(() => mocks.application)
    sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
    sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
    sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
  })

  lab.afterEach(() => {
    sandbox.restore()
  })

  new GeneralTestHelper({ lab, routePath }).test()

  lab.experiment(`GET ${routePath}`, () => {
    let request
    lab.beforeEach(() => {
      request = { method: 'GET', url: routePath, headers: {} }
    })

    lab.experiment('success', () => {
      lab.test('page displays correct details', async () => {
        const doc = await GeneralTestHelper.getDoc(request)
        Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Does your site or installation already have an environmental (EPR) permit?')
        Code.expect(doc.getElementById('existing-permit-yes')).to.exist()
        Code.expect(doc.getElementById('existing-permit-yes').getAttribute('value')).to.equal('yes')
        Code.expect(doc.getElementById('existing-permit-no')).to.exist()
        Code.expect(doc.getElementById('existing-permit-no').getAttribute('value')).to.equal('no')
      })
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    let postRequest

    lab.beforeEach(() => {
      postRequest = { method: 'POST', url: routePath, headers: {}, payload: {} }
    })

    lab.experiment('success', () => {
      lab.test('when yes selected', async () => {
        postRequest.payload['existing-permit'] = 'yes'
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePathYes)
      })
      lab.test('when no selected', async () => {
        postRequest.payload['existing-permit'] = 'no'
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePathNo)
      })
    })

    lab.experiment('invalid', () => {
      lab.test('when no option selected', async () => {
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessage(doc, 'existing-permit', 'Select a value')
      })
      lab.test('when invalid option provided', async () => {
        postRequest.payload['existing-permit'] = 'invalid'
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessage(doc, 'existing-permit', 'Provide a valid value')
      })
    })
  })
})