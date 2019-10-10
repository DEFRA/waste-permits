'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const TaskDeterminants = require('../../src/models/taskDeterminants.model')
const Application = require('../../src/persistence/entities/application.entity')
const Item = require('../../src/persistence/entities/item.entity')
const RecoveryService = require('../../src/services/recovery.service')
const CookieService = require('../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../src/constants')

const routePath = '/waste-assessment'
const nextPath = '/maintain-application-lines'
const applyOfflinePath = '/waste-assessment/apply-offline'

let sandbox
let mocks
let saveSpy

const viewableAssessments = [
  { id: 'ass-1', shortName: '1-19-1', itemName: 'Section 1.19.1', canApplyFor: true, canApplyOnline: true },
  { id: 'ass-2', shortName: '1-19-2', itemName: 'Section 1.19.2', canApplyFor: true, canApplyOnline: false }
]
const nonViewableAssessment = { id: 'ass-3', shortName: '1-19-99', itemName: 'Section 1.19.99', canApplyFor: false, canApplyOnline: false }
const allAssessments = [ ...viewableAssessments, nonViewableAssessment]

lab.beforeEach(() => {
  mocks = new Mocks()
  mocks.context.isBespoke = true

  mocks.taskDeterminants.allAssessments = allAssessments.map((assessment) => new Item(assessment))

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(TaskDeterminants, 'get').value(() => mocks.taskDeterminants)
  saveSpy = sandbox.stub(TaskDeterminants.prototype, 'save').callsFake(() => false)
  sandbox.stub(Item, 'listWasteAssessments').value(async () => mocks.taskDeterminants.allAssessments)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(async () => mocks.recovery)
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Waste assessments', () => {
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

    lab.experiment('GET displays the correct waste assessments', () => {
      viewableAssessments.forEach(({ shortName, itemName }) => {
        lab.test(`should include option for ${itemName}`, async () => {
          const doc = await GeneralTestHelper.getDoc(getRequest)
          const prefix = `assessment-${shortName}`
          Code.expect(doc.getElementById(`${prefix}-input`)).to.exist()
          Code.expect(doc.getElementById(`${prefix}-input`).getAttribute('value')).to.equal(shortName)
          Code.expect(doc.getElementById(`${prefix}-label`)).to.exist()
          Code.expect(doc.getElementById(`${prefix}-text`)).to.exist()
          Code.expect(doc.getElementById(`${prefix}-text`).firstChild.nodeValue.trim()).to.equal(itemName)
        })
      })
      lab.test(`should not include option for ${nonViewableAssessment.itemName}`, async () => {
        const doc = await GeneralTestHelper.getDoc(getRequest)
        Code.expect(doc.getElementById(`assessment-${nonViewableAssessment.shortName}-input`)).to.not.exist()
      })

      lab.test(`should show selected option`, async () => {
        mocks.taskDeterminants.wasteAssessments = [mocks.taskDeterminants.allAssessments[0]]
        const doc = await GeneralTestHelper.getDoc(getRequest)
        Code.expect(doc.getElementById(`assessment-${viewableAssessments[0].shortName}-input`)).to.exist()
        Code.expect(doc.getElementById(`assessment-${viewableAssessments[0].shortName}-input`).getAttribute('checked')).to.equal('checked')
      })
    })
  })

  lab.experiment('POST:', () => {

    let postRequest
    lab.beforeEach(() => {
        postRequest = {
          method: 'POST',
          url: routePath,
          headers: {},
          payload: { 'assessment': 'ass-1' }
        }
    })

    lab.test('POST waste assessment saves and redirects to next route', async () => {
      const res = await server.inject(postRequest)
      Code.expect(saveSpy.called).to.be.true()
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextPath)
    })

    lab.test('POST with no waste assessments also redirects to next route', async () => {
      postRequest.payload = {}
      const res = await server.inject(postRequest)
      Code.expect(saveSpy.called).to.be.true()
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextPath)
    })

    lab.test('POST for waste assessment that cannot be applied for online shows apply offline page', async () => {
      postRequest.payload = { 'assessment': 'ass-2' }
      mocks.taskDeterminants.wasteAssessments = [mocks.taskDeterminants.allAssessments[1]]
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(applyOfflinePath)
    })

    lab.test('POST for waste assessment that cannot be applied for shows apply offline page', async () => {
      postRequest.payload = { 'assessment': 'ass-3' }
      mocks.taskDeterminants.wasteAssessments = [mocks.taskDeterminants.allAssessments[2]]
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(applyOfflinePath)
    })

    lab.test('POST for multiple waste assessments where some cannot be applied for online shows apply offline page', async () => {
      postRequest.payload = { 'assessment': 'ass-1,ass-2' }
      mocks.context.taskDeterminants.wasteAssessments = [mocks.taskDeterminants.allAssessments[0], mocks.taskDeterminants.allAssessments[1]]
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(applyOfflinePath)
    })
  })

})
