'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('./generalTestHelper.test')

const DynamicsSolution = require('../../src/models/dynamicsSolution.model')
const RecoveryService = require('../../src/services/recovery.service')

let sandbox

const routePath = '/version'

const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {}
}

// Test data
const dynamicsVersionInfo = [{
  componentName: 'FIRST_COMPONENT',
  version: '1.2.3'
}, {
  componentName: 'SECOND_COMPONENT',
  version: '4.5.6'
}, {
  componentName: 'THIRD_COMPONENT',
  version: '7.8.9'
}]

lab.beforeEach(() => {
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(DynamicsSolution, 'get').value(() => dynamicsVersionInfo)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => {})
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Version page tests:', () => {
  lab.test('The page should NOT have a back link', async () => {
    const doc = await GeneralTestHelper.getDoc(getRequest)

    let element = doc.getElementById('back-link')
    Code.expect(element).to.not.exist()
  })

  lab.test(`GET ${routePath} returns the version page correctly`, async () => {
    const doc = await GeneralTestHelper.getDoc(getRequest)

    let element = doc.getElementById('page-heading').firstChild
    Code.expect(element.nodeValue).to.equal('Waste Permits')

    for (let i = 0; i < dynamicsVersionInfo.length; i++) {
      element = doc.getElementById(`dynamics-item-${i}-component-name`).firstChild
      Code.expect(element.nodeValue).to.equal(dynamicsVersionInfo[i].componentName)

      element = doc.getElementById(`dynamics-item-${i}-component-version`).firstChild
      Code.expect(element.nodeValue).to.equal(dynamicsVersionInfo[i].version)
    }
  })
})
