'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')

const Application = require('../../src/persistence/entities/application.entity')
const CostTime = require('../../src/models/taskList/costTime.task')
const RecoveryService = require('../../src/services/recovery.service')
const StandardRuleType = require('../../src/persistence/entities/standardRuleType.entity')
const CookieService = require('../../src/services/cookie.service')
const LoggingService = require('../../src/services/logging.service')
const { COOKIE_RESULT } = require('../../src/constants')

const routePath = '/costs-times'
const nextRoutePath = '/task-list'
const errorPath = '/errors/technical-problem'

let mocks
let sandbox

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
  sandbox.stub(Application, 'getById').value(() => mocks.application)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(CostTime, 'isComplete').value(() => false)
  sandbox.stub(CostTime, 'updateCompleteness').value(() => {})
  sandbox.stub(StandardRuleType, 'getById').value(() => mocks.standardRuleType)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Cost and time for this permit page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test()

  const checkCommonElements = (doc) => {
    GeneralTestHelper.checkElementsExist(doc, [
      'back-link',
      'submit-button',
      'cost-to-apply-heading',
      'cost-to-apply-description',
      'time-to-wait-text',
      'more-info-text',
      'length-of-time-text',
      'no-vat-text',
      'vat-abbr'
    ])
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
      lab.test(`when standard rule is not a recovery plan`, async () => {
        const doc = await GeneralTestHelper.getDoc(getRequest)
        checkCommonElements(doc)
        Code.expect(doc.getElementById('includes-waste-recovery-plan')).to.not.exist()
        Code.expect(GeneralTestHelper.getText(doc.getElementById('length-of-time-text'))).to.equal('up to 13 weeks')
      })

      lab.test(`when standard rule is a recovery plan`, async () => {
        mocks.standardRule.code = 'SR2015 No 39'
        const doc = await GeneralTestHelper.getDoc(getRequest)
        checkCommonElements(doc)
        Code.expect(doc.getElementById('includes-waste-recovery-plan')).to.exist()
        Code.expect(GeneralTestHelper.getText(doc.getElementById('length-of-time-text'))).to.equal('up to 13 weeks')
      })

      lab.test(`when standard rule is for an mcp`, async () => {
        mocks.standardRuleType.categoryName = 'MCPD-MCP'
        const doc = await GeneralTestHelper.getDoc(getRequest)
        checkCommonElements(doc)
        Code.expect(doc.getElementById('includes-waste-recovery-plan')).to.not.exist()
        Code.expect(GeneralTestHelper.getText(doc.getElementById('length-of-time-text'))).to.equal('up to 9 weeks')
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

    lab.test('success', async () => {
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextRoutePath)
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when updateCompleteness fails', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        CostTime.updateCompleteness = () => {
          throw new Error('update failed')
        }

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })
})
