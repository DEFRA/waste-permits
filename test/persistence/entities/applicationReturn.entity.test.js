'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const ApplicationLine = require('../../../src/persistence/entities/applicationLine.entity')
const ApplicationReturn = require('../../../src/persistence/entities/applicationReturn.entity')
const dynamicsDal = require('../../../src/services/dynamicsDal.service')

const context = { }
let fakeApplicationLine
let fakeApplicationReturn

const fakeDynamicsRecord = (options = {}) => {
  const applicationReturn = Object.assign({}, fakeApplicationReturn, options)
  return {
    defra_suffix: applicationReturn.slug,
    _defra_application_value: applicationReturn.applicationId
  }
}

let sandbox

lab.beforeEach(() => {
  fakeApplicationLine = {
    standardRuleId: 'STANDARD_RULE_ID'
  }

  fakeApplicationReturn = {
    slug: 'SLUG',
    applicationId: 'APPLICATION_ID'
  }

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()
  // Stub the asynchronous model methods
  sandbox.stub(dynamicsDal, 'search').value((dataObject) => dataObject.id)
  sandbox.stub(ApplicationLine, 'getById').value(() => fakeApplicationLine)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('ApplicationReturn Entity tests:', () => {
  lab.test('getBySlug() method returns an ApplicationReturn object', async () => {
    dynamicsDal.search = () => {
      return {
        value: [fakeDynamicsRecord()]
      }
    }

    const spy = sinon.spy(dynamicsDal, 'search')
    const applicationReturn = await ApplicationReturn.getBySlug(context)
    Code.expect(applicationReturn).to.equal(fakeApplicationReturn)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('getByApplicationId() method returns an ApplicationReturn object', async () => {
    dynamicsDal.search = () => {
      return {
        value: [fakeDynamicsRecord()]
      }
    }

    const spy = sinon.spy(dynamicsDal, 'search')
    const applicationReturn = await ApplicationReturn.getByApplicationId(context)
    Code.expect(applicationReturn).to.equal(fakeApplicationReturn)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('save() method should fail as this entity is readOnly', async () => {
    let error
    try {
      const applicationReturn = new ApplicationReturn(fakeApplicationReturn)
      await applicationReturn.save()
    } catch (err) {
      error = err
    }
    Code.expect(error.message).to.equal('Unable to save defra_saveandreturns: Read only!')
  })
})
