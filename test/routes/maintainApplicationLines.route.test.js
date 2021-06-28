'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const ApplicationLine = require('../../src/persistence/entities/applicationLine.entity')
const Item = require('../../src/persistence/entities/item.entity')
const WasteActivities = require('../../src/models/wasteActivities.model')
const RecoveryService = require('../../src/services/recovery.service')
const CookieService = require('../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../src/constants')

const routePath = '/maintain-application-lines'
const nextPath = '/confirm-cost'

let sandbox
let mocks
let deleteSpy
let saveSpy

const allActivities = [
  { id: 'act-1', shortName: '1-10-2' },
  { id: 'act-2', shortName: '1-10-3' },
  { id: 'act-3', shortName: '2-4-5' },
  { id: 'act-4', shortName: '44-5-6' },
  { id: 'act-5', shortName: 'ABC-D' }
]

const allAssessments = [
  { id: 'ass-1', shortName: 'MCP-EER' },
  { id: 'ass-2', shortName: 'MCP-BAT' },
  { id: 'ass-3', shortName: '1-19-2' }
]

lab.beforeEach(() => {
  mocks = new Mocks()
  mocks.context.isBespoke = true
  mocks.applicationLines = []

  mocks.taskDeterminants.allAssessments = allAssessments.map(({ id, shortName }) => new Item({ id, shortName }))

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(ApplicationLine, 'getByApplicationId').value(() => mocks.applicationLine)
  sandbox.stub(ApplicationLine, 'listBy').value(async () => mocks.applicationLines)
  deleteSpy = sandbox.stub(ApplicationLine.prototype, 'delete').callsFake(() => false)
  saveSpy = sandbox.stub(ApplicationLine.prototype, 'save').callsFake(() => false)
  sandbox.stub(Item, 'listWasteActivities').value(async () => mocks.wasteActivities)
  sandbox.stub(Item, 'listWasteAssessments').value(async () => mocks.wasteAssessments)
  sandbox.stub(WasteActivities, 'get').resolves(new WasteActivities(allActivities.map(({ id, shortName }) => new Item({ id, shortName })), mocks.wasteActivities))
  sandbox.stub(RecoveryService, 'createApplicationContext').value(async () => mocks.recovery)
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Maintain application lines: Redirect to confirm costs', () => {
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
          Code.expect(res.headers.location).to.equal(nextPath)
        })

        lab.test('when there are application lines but no changes', async () => {
          const preSelectedActivities = allActivities.map(({ shortName }) => ({ id: shortName, name: '' }))
          mocks.wasteActivities.push(...preSelectedActivities)
          allActivities.forEach(({ id }) => mocks.applicationLines.push(new ApplicationLine(Object.assign({}, mocks.applicationLine, { itemId: id }))))

          const res = await server.inject(getRequest)
          Code.expect(saveSpy.callCount).to.equal(allActivities.length)
          Code.expect(deleteSpy.callCount).to.equal(allActivities.length)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers.location).to.equal(nextPath)
        })

        lab.test('when there are application lines to delete and some to add', async () => {
          const itemsToDelete = [allActivities[0], allActivities[1]]
          const itemsToAdd = [allActivities[2], allActivities[3]].map(({ shortName }) => ({ id: shortName, name: '' }))
          mocks.wasteActivities.push(...itemsToAdd)
          itemsToDelete.forEach(({ id }) => mocks.applicationLines.push(new ApplicationLine(Object.assign({}, mocks.applicationLine, { itemId: id }))))

          const res = await server.inject(getRequest)
          Code.expect(saveSpy.callCount).to.equal(2)
          Code.expect(deleteSpy.callCount).to.equal(2)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers.location).to.equal(nextPath)
        })

        lab.test('when the facility type is mcp and all flags have been set to true', async () => {
          Object.assign(mocks.taskDeterminants, {
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
          Code.expect(res.headers.location).to.equal(nextPath)
        })

        lab.test('when the facility type is mcp and all flags have been set to false', async () => {
          Object.assign(mocks.taskDeterminants, {
            facilityType: 'mcp',
            airDispersionModellingRequired: false,
            energyEfficiencyReportRequired: false,
            bestAvailableTechniquesAssessment: false,
            habitatAssessmentRequired: false
          })

          allActivities
            .filter(({ shortName }) => shortName !== '1-10-3') // This is to test this activity will be added and the other 7 will be deleted
            .forEach(({ id }) => mocks.applicationLines.push(new ApplicationLine(Object.assign({}, mocks.applicationLine, { itemId: id }))))
          allAssessments
            .forEach(({ id }) => mocks.applicationLines.push(new ApplicationLine(Object.assign({}, mocks.applicationLine, { itemId: id }))))

          const res = await server.inject(getRequest)
          Code.expect(saveSpy.callCount).to.equal(1)
          Code.expect(deleteSpy.callCount).to.equal(7)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers.location).to.equal(nextPath)
        })

        lab.test('mcp facility does not add waste activities', async () => {
          Object.assign(mocks.taskDeterminants, {
            facilityType: 'mcp',
            airDispersionModellingRequired: false,
            energyEfficiencyReportRequired: false,
            bestAvailableTechniquesAssessment: false,
            habitatAssessmentRequired: false
          })
          mocks.wasteActivities.push({ id: 'xxx' }, { id: 'xxx' })
          const res = await server.inject(getRequest)
          Code.expect(saveSpy.callCount).to.equal(1)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers.location).to.equal(nextPath)
        })
      })
    })
  })
})
