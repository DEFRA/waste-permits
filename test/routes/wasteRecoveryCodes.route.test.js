'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const WasteDisposalAndRecoveryCodes = require('../../src/models/wasteDisposalAndRecoveryCodes.model')
const Application = require('../../src/persistence/entities/application.entity')
const RecoveryService = require('../../src/services/recovery.service')
const CookieService = require('../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../src/constants')

const routePath = '/recovery-disposal/recovery/0'
const nextPath = '/task-list'

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)

  sandbox.stub(WasteDisposalAndRecoveryCodes, 'getForActivity').resolves(new WasteDisposalAndRecoveryCodes({ activityDisplayName: 'Fake activity', selectedWasteRecoveryCodes: ['r01'] }))
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Waste recovery codes', () => {
  lab.experiment(`GET ${routePath}`, () => {
    let getRequest

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
    })

    lab.test('provides the correct page', async () => {
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Select the recovery codes for Fake activity')
    })

    lab.test('shows a selected item', async () => {
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('code-r01-input')).to.exist()
      Code.expect(doc.getElementById('code-r01-input').hasAttributes()).to.be.true()
      Code.expect(doc.getElementById('code-r01-input').attributes.getNamedItem('checked')).to.exist()
      Code.expect(doc.getElementById('code-r01-input').attributes.getNamedItem('checked').value).to.equal('checked')
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    let postRequest

    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {
          code: 'r01'
        }
      }
      sandbox.stub(WasteDisposalAndRecoveryCodes.prototype, 'save')
    })

    lab.test('success', async () => {
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextPath)
    })

    lab.test('no values supplied', async () => {
      delete postRequest.payload.code
      const doc = await GeneralTestHelper.getDoc(postRequest)
      await GeneralTestHelper.checkValidationMessage(doc, 'code', 'Select either a disposal or a recovery code for this activity. To add a disposal code, go back to the previous screen.')
    })
  })
})
