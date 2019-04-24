'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const ApplicationLine = require('../../src/persistence/entities/applicationLine.entity')
const Item = require('../../src/persistence/entities/item.entity')
const RecoveryService = require('../../src/services/recovery.service')
const CookieService = require('../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../src/constants')

const routePath = '/maintain-application-lines'
const nextPath = '/confirm-cost'

let sandbox
let mocks
let deleteSpy
let saveSpy

const wasteActivities = [
  { id: 'act-1', shortName: '1-10-2' },
  { id: 'act-2', shortName: '2-4-5' },
  { id: 'act-3', shortName: '44-5-6' },
  { id: 'act-4', shortName: 'ABC-D' }
]

const wasteAssessments = [
  { id: 'ass-1', shortName: 'MCP-EER' },
  { id: 'ass-2', shortName: 'MCP-BAT' },
  { id: 'ass-3', shortName: '1-19-2' }
]

lab.beforeEach(() => {
  mocks = new Mocks()
  mocks.context.isBespoke = true
  mocks.applicationLines = []

  wasteActivities.forEach(({ id, shortName }) => {
    mocks.wasteActivities.push(new Item({ id, shortName }))
  })
  wasteAssessments.forEach(({ id, shortName }) => {
    mocks.wasteAssessments.push(new Item({ id, shortName }))
  })

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(ApplicationLine, 'listBy').value(async () => mocks.applicationLines)
  deleteSpy = sandbox.stub(ApplicationLine.prototype, 'delete').callsFake(() => false)
  saveSpy = sandbox.stub(ApplicationLine.prototype, 'save').callsFake(() => false)
  sandbox.stub(Item, 'listWasteActivities').value(async () => mocks.wasteActivities)
  sandbox.stub(Item, 'listWasteAssessments').value(async () => mocks.wasteAssessments)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(async () => mocks.recovery)
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Permit holder details: Redirect to correct details flow', () => {
  new GeneralTestHelper({ lab, routePath }).test({ excludeCookiePostTests: true, excludeHtmlTests: true })

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
      lab.experiment('redirects to confirm costs correctly', () => {
        lab.test('when there are no application lines and none to add', async () => {
          const res = await server.inject(getRequest)
          Code.expect(saveSpy.callCount).to.equal(0)
          Code.expect(deleteSpy.callCount).to.equal(0)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(nextPath)
        })

        lab.test('when there are application lines but none to delete and none to add', async () => {
          mocks.dataStore.wasteActivities = wasteActivities.map(({ shortName }) => shortName).join(',')
          wasteActivities.forEach(({ id }) => mocks.applicationLines.push(new ApplicationLine(Object.assign({}, mocks.applicationLine, { itemId: id }))))

          const res = await server.inject(getRequest)
          Code.expect(saveSpy.callCount).to.equal(0)
          Code.expect(deleteSpy.callCount).to.equal(0)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(nextPath)
        })

        lab.test('when there are application lines to delete and some to add', async () => {
          const itemsToDelete = [wasteActivities[0], wasteActivities[1]]
          const itemsToAdd = [wasteActivities[2], wasteActivities[3]]
          mocks.dataStore.wasteActivities = itemsToAdd.map(({ shortName }) => shortName).join(',')
          itemsToDelete.forEach(({ id }) => mocks.applicationLines.push(new ApplicationLine(Object.assign({}, mocks.applicationLine, { itemId: id }))))

          const res = await server.inject(getRequest)
          Code.expect(saveSpy.callCount).to.equal(2)
          Code.expect(deleteSpy.callCount).to.equal(2)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(nextPath)
        })

        lab.test('when the facility type is mcp and all flags have been set to true', async () => {
          Object.assign(mocks.dataStore, {
            facilityType: 'mcp',
            airDispersionModellingRequired: true,
            energyEfficiencyReportRequired: true,
            bestAvailableTechniquesAssessment: true,
            habitatAssessmentRequired: true
          })

          const res = await server.inject(getRequest)
          Code.expect(saveSpy.callCount).to.equal(4)
          Code.expect(deleteSpy.callCount).to.equal(0)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(nextPath)
        })

        lab.test('when the facility type is mcp and all flags have been set to false', async () => {
          Object.assign(mocks.dataStore, {
            facilityType: 'mcp',
            airDispersionModellingRequired: false,
            energyEfficiencyReportRequired: false,
            bestAvailableTechniquesAssessment: false,
            habitatAssessmentRequired: false
          })

          wasteActivities.forEach(({ id }) => mocks.applicationLines.push(new ApplicationLine(Object.assign({}, mocks.applicationLine, { itemId: id }))))
          wasteAssessments.forEach(({ id }) => mocks.applicationLines.push(new ApplicationLine(Object.assign({}, mocks.applicationLine, { itemId: id }))))

          const res = await server.inject(getRequest)
          Code.expect(saveSpy.callCount).to.equal(0)
          Code.expect(deleteSpy.callCount).to.equal(7)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(nextPath)
        })
      })
    })
  })
})
