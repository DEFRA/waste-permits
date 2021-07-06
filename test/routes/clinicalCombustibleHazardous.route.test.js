'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const RecoveryService = require('../../src/services/recovery.service')
const LoggingService = require('../../src/services/logging.service')
const CookieService = require('../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../src/constants')

const DataStore = require('../../src/models/dataStore.model')
const WasteActivities = require('../../src/models/wasteActivities.model')

const routePath = '/select/bespoke/clinical-combustible-hazardous'
const nextRoutePath = '/waste-assessment'

let sandbox
let mocks
let mockWasteTypes
let dataStoreSaveFake
let wasteActivitiesValuesStub

const checkCommonElements = async (doc) => {
  Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Do you accept any of these types of waste?')
  Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')
}

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  mockWasteTypes = {
    data: {
      wasteActivities: []
    }
  }

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => undefined)
  sandbox.stub(DataStore, 'get').callsFake(async () => mockWasteTypes)
  sandbox.stub(WasteActivities, 'get').resolves(new WasteActivities([], []))
  wasteActivitiesValuesStub = sandbox.stub(WasteActivities.prototype, 'wasteActivitiesValues')
  wasteActivitiesValuesStub.value([])
  dataStoreSaveFake = sandbox.stub(DataStore, 'save')
  dataStoreSaveFake.callsFake(async () => undefined)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Clinical, combustible and hazardous waste page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test()

  lab.experiment(`GET ${routePath}`, () => {
    let request

    lab.beforeEach(() => {
      request = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
    })

    lab.experiment('success', () => {
      lab.test('when first time', async () => {
        const doc = await GeneralTestHelper.getDoc(request)
        await checkCommonElements(doc)
        Code.expect(doc.getElementById('clinical').getAttribute('checked')).to.equal('')
        Code.expect(doc.getElementById('combustible').getAttribute('checked')).to.equal('')
        Code.expect(doc.getElementById('hazardous').getAttribute('checked')).to.equal('')
        Code.expect(doc.getElementById('none-required').getAttribute('checked')).to.equal('')
      })

      lab.test('when value already selected', async () => {
        mockWasteTypes.data.acceptsClinicalWaste = true
        const doc = await GeneralTestHelper.getDoc(request)
        await checkCommonElements(doc)
        Code.expect(doc.getElementById('clinical').getAttribute('checked')).to.equal('checked')
        Code.expect(doc.getElementById('combustible').getAttribute('checked')).to.equal('')
        Code.expect(doc.getElementById('hazardous').getAttribute('checked')).to.equal('')
        Code.expect(doc.getElementById('none-required').getAttribute('checked')).to.equal('')
      })

      lab.test('when hazardous activity selected', async () => {
        wasteActivitiesValuesStub.value([{ id: '1-16-5' }])
        const doc = await GeneralTestHelper.getDoc(request)
        await checkCommonElements(doc)
        Code.expect(doc.getElementById('clinical').getAttribute('checked')).to.equal('')
        Code.expect(doc.getElementById('combustible').getAttribute('checked')).to.equal('')
        Code.expect(doc.getElementById('hazardous').getAttribute('checked')).to.equal('checked')
        Code.expect(doc.getElementById('none-required').getAttribute('checked')).to.equal('')
      })

      lab.test('when clinical activity selected', async () => {
        wasteActivitiesValuesStub.value([{ id: '1-16-7' }])
        const doc = await GeneralTestHelper.getDoc(request)
        await checkCommonElements(doc)
        Code.expect(doc.getElementById('clinical').getAttribute('checked')).to.equal('checked')
        Code.expect(doc.getElementById('combustible').getAttribute('checked')).to.equal('')
        Code.expect(doc.getElementById('hazardous').getAttribute('checked')).to.equal('')
        Code.expect(doc.getElementById('none-required').getAttribute('checked')).to.equal('')
      })

      lab.test('when multiple activities selected', async () => {
        wasteActivitiesValuesStub.value([{ id: '1-16-7' }, { id: '1-16-5' }, { id: '1-16-0' }])
        const doc = await GeneralTestHelper.getDoc(request)
        await checkCommonElements(doc)
        Code.expect(doc.getElementById('clinical').getAttribute('checked')).to.equal('checked')
        Code.expect(doc.getElementById('combustible').getAttribute('checked')).to.equal('')
        Code.expect(doc.getElementById('hazardous').getAttribute('checked')).to.equal('checked')
        Code.expect(doc.getElementById('none-required').getAttribute('checked')).to.equal('')
      })

      lab.test('when no relevant activity selected', async () => {
        wasteActivitiesValuesStub.value([{ id: '1-16-0' }])
        const doc = await GeneralTestHelper.getDoc(request)
        await checkCommonElements(doc)
        Code.expect(doc.getElementById('clinical').getAttribute('checked')).to.equal('')
        Code.expect(doc.getElementById('combustible').getAttribute('checked')).to.equal('')
        Code.expect(doc.getElementById('hazardous').getAttribute('checked')).to.equal('')
        Code.expect(doc.getElementById('none-required').getAttribute('checked')).to.equal('')
      })

      lab.test('previous selections should override activity', async () => {
        wasteActivitiesValuesStub.value([{ id: '1-16-7' }])
        mockWasteTypes.data.acceptsClinicalWaste = false
        const doc = await GeneralTestHelper.getDoc(request)
        await checkCommonElements(doc)
        Code.expect(doc.getElementById('clinical').getAttribute('checked')).to.equal('')
      })
    })

    lab.experiment('failure', () => {
      lab.test('error screen when failing to recover the application', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        RecoveryService.createApplicationContext = () => {
          throw new Error('application recovery failed')
        }

        const res = await server.inject(request)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(500)
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
        payload: {
        }
      }
    })

    lab.experiment('success', () => {
      lab.test('when all selected', async () => {
        postRequest.payload.clinical = 'yes'
        postRequest.payload.combustible = 'yes'
        postRequest.payload.hazardous = 'yes'
        const res = await server.inject(postRequest)

        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers.location).to.equal(nextRoutePath)
        Code.expect(dataStoreSaveFake.calledWith(mocks.recovery, {
          acceptsClinicalWaste: true,
          acceptsCombustibleWaste: true,
          acceptsHazardousWaste: true,
          doesntAcceptClinicalCombustibleOrHazardousWaste: false
        })).to.be.true()
      })

      lab.test('when none selected', async () => {
        postRequest.payload['none-required'] = 'yes'
        const res = await server.inject(postRequest)

        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers.location).to.equal(nextRoutePath)
        Code.expect(dataStoreSaveFake.calledWith(mocks.recovery, {
          acceptsClinicalWaste: false,
          acceptsCombustibleWaste: false,
          acceptsHazardousWaste: false,
          doesntAcceptClinicalCombustibleOrHazardousWaste: true
        })).to.be.true()
      })

      lab.test('when each selected', async () => {
        let res
        postRequest.payload = { clinical: 'yes' }
        res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers.location).to.equal(nextRoutePath)
        Code.expect(dataStoreSaveFake.calledWith(mocks.recovery, {
          acceptsClinicalWaste: true,
          acceptsCombustibleWaste: false,
          acceptsHazardousWaste: false,
          doesntAcceptClinicalCombustibleOrHazardousWaste: false
        })).to.be.true()

        postRequest.payload = { combustible: 'yes' }
        res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers.location).to.equal(nextRoutePath)
        Code.expect(dataStoreSaveFake.calledWith(mocks.recovery, {
          acceptsClinicalWaste: false,
          acceptsCombustibleWaste: true,
          acceptsHazardousWaste: false,
          doesntAcceptClinicalCombustibleOrHazardousWaste: false
        })).to.be.true()

        postRequest.payload = { hazardous: 'yes' }
        res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers.location).to.equal(nextRoutePath)
        Code.expect(dataStoreSaveFake.calledWith(mocks.recovery, {
          acceptsClinicalWaste: false,
          acceptsCombustibleWaste: false,
          acceptsHazardousWaste: true,
          doesntAcceptClinicalCombustibleOrHazardousWaste: false
        })).to.be.true()
      })
    })

    lab.experiment('invalid', () => {
      lab.test('when no values selected', async () => {
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'select', 'Select at least one option. If you don’t accept any of these select ‘None of these’.')
      })
      lab.test('when both waste types and \'None\' are selected', async () => {
        postRequest.payload['none-required'] = 'yes'
        postRequest.payload.clinical = 'yes'
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'select', 'You cannot select a type and ‘None of these’. Please deselect one of them.')
      })
      lab.test('when multiple types and \'None\' are selected, only shows single error message', async () => {
        postRequest.payload['none-required'] = 'yes'
        postRequest.payload.clinical = 'yes'
        postRequest.payload.hazardous = 'yes'
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'select', 'You cannot select a type and ‘None of these’. Please deselect one of them.')
        await GeneralTestHelper.checkValidationMessageCount(doc, 1)
        await GeneralTestHelper.checkNoValidationMessage(doc, 'hazardous')
      })
    })
  })
})
