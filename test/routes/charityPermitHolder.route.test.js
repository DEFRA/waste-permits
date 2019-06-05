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
const CharityDetail = require('../../src/models/charityDetail.model')
const RecoveryService = require('../../src/services/recovery.service')
const { INDIVIDUAL, LIMITED_COMPANY, PUBLIC_BODY } = require('../../src/dynamics').PERMIT_HOLDER_TYPES
const { COOKIE_RESULT } = require('../../src/constants')

let sandbox

const routePath = '/permit-holder/charity-permit-holder'
const nextPath = '/permit-holder/charity-details'

let getRequest
let postRequest
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  const { charityPermitHolder } = mocks.charityDetail
  mocks.recovery.charityDetail = mocks.charityDetail

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
      'charity-permit-holder-type': charityPermitHolder
    }
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(CharityDetail.prototype, 'save').value(() => undefined)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

const checkPageElements = async (request) => {
  const doc = await GeneralTestHelper.getDoc(request)

  Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(`Choose the permit holder for the charity or trust`)

  // Test for the existence of expected static content
  GeneralTestHelper.checkElementsExist(doc, [
    'back-link',
    'defra-csrf-token'
  ])

  Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')
}

const checkValidationErrors = async (field, expectedErrors) => {
  const doc = await GeneralTestHelper.getDoc(postRequest)

  let element

  for (let i = 0; i < expectedErrors.length; i++) {
    // Panel summary error item
    element = doc.getElementById(`error-summary-list-item-${i}`).firstChild
    Code.expect(element.nodeValue).to.equal(expectedErrors[i])

    // Field error
    Code.expect(doc.getElementById(field).getAttribute('class')).contains('form-group-error')
    element = doc.getElementById(`${field}-error`).childNodes[i].firstChild
    Code.expect(element.nodeValue).to.equal(expectedErrors[i])
  }
}

lab.experiment('Charity permit holder page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test()

  lab.experiment('GET:', () => {
    lab.test(`GET ${routePath} returns the charity permit holder page correctly when the charity permit holder is not selected`, async () => {
      mocks.charityDetail.charityPermitHolder = undefined
      checkPageElements(getRequest)
    })

    const permitHolderTypes = [INDIVIDUAL, LIMITED_COMPANY, PUBLIC_BODY]
    permitHolderTypes.forEach((permitHolderType) =>
      lab.test(`GET ${routePath} returns the charity permit holder page correctly when the charity permit holder "${permitHolderType.type}" is selected`, async () => {
        mocks.charityDetail.charityPermitHolder = permitHolderType.id
        checkPageElements(getRequest, permitHolderType.id)
      })
    )
  })

  lab.experiment('POST:', () => {
    lab.experiment('Success:', () => {
      lab.experiment(`POST ${routePath} redirects to the next route ${nextPath}`, () => {
        const permitHolderTypes = [INDIVIDUAL, LIMITED_COMPANY, PUBLIC_BODY]
        permitHolderTypes.forEach((permitHolderType) =>
          lab.test(`when the permit holder is: ${permitHolderType.type}`, async () => {
            postRequest.payload['charity-permit-holder-type'] = permitHolderType.id
            const res = await server.inject(postRequest)
            Code.expect(mocks.charityDetail.charityPermitHolder).to.equal(permitHolderType.id)
            Code.expect(res.statusCode).to.equal(302)
            Code.expect(res.headers['location']).to.equal(nextPath)
          })
        )
      })
    })

    lab.experiment('Invalid:', () => {
      lab.test(`POST ${routePath} shows an error message when the charity permit holder is not selected`, async () => {
        postRequest.payload['charity-permit-holder-type'] = ''
        await checkValidationErrors('charity-permit-holder-type', ['Select the permit holder'])
      })
    })
  })
})
