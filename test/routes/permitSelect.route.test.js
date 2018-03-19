'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const DOMParser = require('xmldom').DOMParser
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const LoggingService = require('../../src/services/logging.service')

const Application = require('../../src/models/application.model')
const ApplicationLine = require('../../src/models/applicationLine.model')
const Payment = require('../../src/models/payment.model')
const StandardRule = require('../../src/models/standardRule.model')
const StandardRuleType = require('../../src/models/standardRuleType.model')
const {COOKIE_RESULT} = require('../../src/constants')

const routePath = '/permit/select'
const nextRoutePath = '/task-list'
const offlineRoutePath = '/start/apply-offline'
const errorPath = '/errors/technical-problem'

let fakeApplication
let fakeStandardRule
let fakeStandardRuleType
let sandbox

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID',
    applicationName: 'APPLICATION_NAME'
  }

  fakeStandardRule = {
    id: 'bd610c23-8ba7-e711-810a-5065f38a5b01',
    permitName: 'Metal recycling, vehicle storage, depollution and dismantling facility',
    limits: 'Less than 25,000 tonnes a year of waste metal and less than 5,000 tonnes a year of waste motor vehicles',
    code: 'SR2015 No 18',
    codeForId: 'sr2015-no-18',
    canApplyOnline: true
  }

  fakeStandardRuleType = {
    id: 'STANDARD_RULE_TYPE_ID',
    category: 'category',
    hint: 'category_HINT',
    categoryName: 'category_NAME'
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(ApplicationLine.prototype, 'save').value(() => {})
  sandbox.stub(LoggingService, 'logError').value(() => {})
  sandbox.stub(Payment, 'getByApplicationLineIdAndType').value(() => {})
  sandbox.stub(Payment.prototype, 'isPaid').value(() => false)
  sandbox.stub(StandardRule, 'list').value(() => [fakeStandardRule])
  sandbox.stub(StandardRule, 'getByCode').value(() => fakeStandardRule)
  sandbox.stub(StandardRuleType, 'getById').value(() => new Application(fakeStandardRuleType))
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Select a permit page tests:', () => {
  new GeneralTestHelper(lab, routePath).test()

  const getDoc = async (request) => {
    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    return parser.parseFromString(res.payload, 'text/html')
  }

  const checkCommonElements = async (doc) => {
    Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Select a permit')
    Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')
    Code.expect(doc.getElementById('select-permit-hint-text')).to.exist()
    Code.expect(doc.getElementById('permit-type-description').firstChild.nodeValue).to.equal(fakeStandardRuleType.category)
  }

  lab.experiment(`GET ${routePath}`, () => {
    let getRequest

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
    })

    lab.experiment('success', () => {
      let permits

      const newPermit = (options) => new StandardRule(Object.assign({}, fakeStandardRule, options))

      lab.beforeEach(() => {
        permits = [
          newPermit({id: 'permit-0', permitName: 'Permit one', limits: '', code: 'permit code 0', codeForId: 'permit-code-0'}),
          newPermit({id: 'permit-1', permitName: 'Permit two', limits: 'limit two', code: 'permit code 1', codeForId: 'permit-code-1'}),
          newPermit({id: 'permit-2', permitName: 'Permit three', limits: '', code: 'permit code 2', codeForId: 'permit-code-2'}),
          newPermit({id: 'permit-3', permitName: 'Permit four', limits: '', code: 'permit code 3', codeForId: 'permit-code-3'})
        ]
        StandardRule.list = () => permits
      })

      lab.test('should include permits ', async () => {
        const doc = await getDoc(getRequest)
        checkCommonElements(doc)

        permits.forEach(({id, permitName, code, limits, codeForId}) => {
          const prefix = `chosen-permit-${codeForId}`
          Code.expect(doc.getElementById(`${prefix}-input`).getAttribute('value')).to.equal(code)
          Code.expect(doc.getElementById(`${prefix}-label`)).to.exist()
          Code.expect(doc.getElementById(`${prefix}-name`).firstChild.nodeValue.trim()).to.equal(permitName)
          Code.expect(doc.getElementById(`${prefix}-code`).firstChild.nodeValue.trim()).to.equal(code)
          if (limits) {
            Code.expect(doc.getElementById(`${prefix}-weight`).firstChild.nodeValue.trim()).to.equal(limits)
          } else {
            Code.expect(doc.getElementById(`${prefix}-weight`)).to.not.exist()
          }
        })
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to get the application ID', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        Application.getById = () => {
          throw new Error('read failed')
        }

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })

      lab.test('redirects to error screen when failing to get the permits', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        StandardRule.list = () => {
          throw new Error('search failed')
        }

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })

      lab.test('redirects to error screen when failing to get the category', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        StandardRuleType.getById = () => {
          throw new Error('read failed')
        }

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    let postRequest

    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {}
      }
    })

    lab.experiment('success', () => {
      lab.test(`redirects to "${nextRoutePath}" when permit selected is an online permit`, async () => {
        postRequest.payload['chosen-permit'] = fakeStandardRule.id
        const res = await server.inject(postRequest)

        // Make sure a redirection has taken place correctly
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test(`redirects to "${offlineRoutePath}" when permit selected is an offline permit`, async () => {
        fakeStandardRule.canApplyOnline = false
        postRequest.payload['chosen-permit'] = fakeStandardRule.id
        const res = await server.inject(postRequest)

        // Make sure a redirection has taken place correctly
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(offlineRoutePath)
      })
    })

    lab.test('invalid when permit not selected', async () => {
      postRequest.payload = {}
      const doc = await getDoc(postRequest)
      await GeneralTestHelper.checkValidationMessage(doc, 'chosen-permit', 'Select the permit you want')
    })
  })
})
