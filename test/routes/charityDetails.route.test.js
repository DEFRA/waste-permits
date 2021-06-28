'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const GeneralTestHelper = require('./generalTestHelper.test')
const Mocks = require('../helpers/mocks')

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const Application = require('../../src/persistence/entities/application.entity')
const Account = require('../../src/persistence/entities/account.entity')
const CharityDetail = require('../../src/models/charityDetail.model')
const RecoveryService = require('../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../src/constants')
const { TRADING_NAME_USAGE } = require('../../src/dynamics')

let sandbox

const routePath = '/permit-holder/charity-details'
const companyRoutePath = '/permit-holder/company/number'
const individualRoutePath = '/permit-holder/name'
const publicBodyRoutePath = '/permit-holder/public-body/address/postcode'
const charityName = 'charity name'
const charityNumber = '012345'

let getRequest
let postRequest
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  getRequest = {
    method: 'GET',
    url: routePath,
    headers: {}
  }

  postRequest = {
    method: 'POST',
    url: routePath,
    headers: {},
    payload: {
      'charity-name': charityName,
      'charity-number': charityNumber
    }
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application, 'getById').value(() => mocks.application)
  sandbox.stub(Application.prototype, 'save').value(() => mocks.application.id)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Account.prototype, 'save').value(() => mocks.account.id)
  sandbox.stub(CharityDetail, 'get').value(() => mocks.charityDetail)
  sandbox.stub(CharityDetail.prototype, 'save').value(() => undefined)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

const checkPageElements = async (request, expectedName, expectedNumber) => {
  const doc = await GeneralTestHelper.getDoc(request)

  let element = doc.getElementById('page-heading').firstChild
  Code.expect(element.nodeValue).to.equal('What is the charity’s name and number?')

  // Test for the existence of expected static content
  GeneralTestHelper.checkElementsExist(doc, [
    'back-link',
    'defra-csrf-token',
    'charity-name',
    'charity-number'
  ])

  element = doc.getElementById('charity-name')
  Code.expect(element.getAttribute('value')).to.equal(expectedName)

  element = doc.getElementById('charity-number')
  Code.expect(element.getAttribute('value')).to.equal(expectedNumber)

  element = doc.getElementById('submit-button').firstChild
  Code.expect(element.nodeValue).to.equal('Continue')
}

const checkValidationErrors = async (field, expectedErrors) => {
  const doc = await GeneralTestHelper.getDoc(postRequest)

  let element

  for (let i = 0; i < expectedErrors.length; i++) {
    // Panel summary error item
    element = doc.getElementById(`error-summary-list-item-${i}`).firstChild
    Code.expect(element.nodeValue).to.equal(expectedErrors[i])

    // Field error
    Code.expect(doc.getElementById(field).getAttribute('class')).contains('form-control-error')
    element = doc.getElementById(`${field}-error`).childNodes[i].firstChild
    Code.expect(element.nodeValue).to.equal(expectedErrors[i])
  }
}

lab.experiment('Charity Details page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test()

  lab.experiment('GET:', () => {
    lab.test(`GET ${routePath} returns the charity details page correctly when it is a new application`, async () => {
      mocks.charityDetail.charityName = ''
      mocks.charityDetail.charityNumber = ''
      checkPageElements(getRequest, '', '')
    })

    lab.test(`GET ${routePath} returns the charity details page correctly when it is a new application where the charity details exist`, async () => {
      const { charityName, charityNumber } = mocks.charityDetail
      checkPageElements(getRequest, charityName, charityNumber)
    })
  })

  lab.experiment('POST:', () => {
    lab.experiment('Success:', () => {
      let originalPermitHolderOrganisationId
      let originalUseTradingName
      let originalTradingName

      lab.beforeEach(() => {
        originalPermitHolderOrganisationId = mocks.application.permitHolderOrganisationId
        originalUseTradingName = mocks.application.useTradingName
        originalTradingName = mocks.application.tradingName
      })

      lab.experiment('when the permit holder is a limited company', async () => {
        lab.beforeEach(() => {
          mocks.charityDetail.charityPermitHolder = 'limited-company'
        })

        lab.test('redirects to the correct route', async () => {
          const res = await server.inject(postRequest)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers.location).to.equal(companyRoutePath)
        })

        lab.test('sets charity details', async () => {
          await server.inject(postRequest)
          Code.expect(mocks.charityDetail.charityName).to.equal(charityName)
          Code.expect(mocks.charityDetail.charityNumber).to.equal(charityNumber)
        })

        lab.test('does not set organisation details', async () => {
          await server.inject(postRequest)
          Code.expect(mocks.application.permitHolderOrganisationId).to.equal(originalPermitHolderOrganisationId)
          Code.expect(mocks.application.useTradingName).to.equal(originalUseTradingName)
          Code.expect(mocks.application.tradingName).to.equal(originalTradingName)
        })
      })

      lab.experiment('when the permit holder is an individual', async () => {
        lab.beforeEach(() => {
          mocks.charityDetail.charityPermitHolder = 'individual'
        })

        lab.test('redirects to the correct route', async () => {
          const res = await server.inject(postRequest)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers.location).to.equal(individualRoutePath)
        })

        lab.test('sets charity details', async () => {
          await server.inject(postRequest)
          Code.expect(mocks.charityDetail.charityName).to.equal(charityName)
          Code.expect(mocks.charityDetail.charityNumber).to.equal(charityNumber)
        })

        lab.test('does not set organisation details', async () => {
          await server.inject(postRequest)
          Code.expect(mocks.application.permitHolderOrganisationId).to.equal(originalPermitHolderOrganisationId)
          Code.expect(mocks.application.useTradingName).to.equal(originalUseTradingName)
          Code.expect(mocks.application.tradingName).to.equal(originalTradingName)
        })
      })

      lab.experiment('when the permit holder is a public body', async () => {
        lab.beforeEach(() => {
          mocks.charityDetail.charityPermitHolder = 'public-body'
        })

        lab.test('redirects to the correct route', async () => {
          const res = await server.inject(postRequest)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers.location).to.equal(publicBodyRoutePath)
        })

        lab.test('sets charity details', async () => {
          await server.inject(postRequest)
          Code.expect(mocks.charityDetail.charityName).to.equal(charityName)
          Code.expect(mocks.charityDetail.charityNumber).to.equal(charityNumber)
        })

        lab.test('sets organisation details', async () => {
          await server.inject(postRequest)
          Code.expect(mocks.application.useTradingName).to.equal(TRADING_NAME_USAGE.YES)
          Code.expect(mocks.application.tradingName).to.equal(charityName)
          Code.expect(mocks.account.accountName).to.equal(charityName)
        })
      })
    })

    lab.experiment('Invalid:', () => {
      lab.test(`POST ${routePath} shows an error message when the charity name is blank`, async () => {
        postRequest.payload['charity-name'] = ''
        await checkValidationErrors('charity-name', ['Enter the charity name'])
      })

      lab.test(`POST ${routePath} shows an error message when the charity number is blank`, async () => {
        postRequest.payload['charity-number'] = ''
        await checkValidationErrors('charity-number', ['Enter a valid charity number'])
      })
    })
  })
})
