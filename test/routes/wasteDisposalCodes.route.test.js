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

const routePath = '/recovery-disposal/disposal/0'
const nextPath = '/recovery-disposal/recovery/0'

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

  sandbox.stub(WasteDisposalAndRecoveryCodes, 'getForActivity').resolves(new WasteDisposalAndRecoveryCodes({ activityDisplayName: 'Fake activity', selectedWasteDisposalCodes: ['d01'] }))
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Waste disposal codes', () => {
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
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Select the disposal codes for Fake activity')
    })

    lab.test('shows a selected item', async () => {
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('code-d01-input')).to.exist()
      Code.expect(doc.getElementById('code-d01-input').hasAttributes()).to.be.true()
      Code.expect(doc.getElementById('code-d01-input').attributes.getNamedItem('checked')).to.exist()
      Code.expect(doc.getElementById('code-d01-input').attributes.getNamedItem('checked').value).to.equal('checked')
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
          code: 'd01'
        }
      }
      sandbox.stub(WasteDisposalAndRecoveryCodes.prototype, 'setWasteDisposalCodes')
      sandbox.stub(WasteDisposalAndRecoveryCodes.prototype, 'save')
    })

    lab.test('success', async () => {
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextPath)
    })
  })
})
