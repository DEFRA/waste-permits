'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const Configuration = require('../../../src/persistence/entities/configuration.entity')

let sandbox

let fakeConfigurationData

const context = { }

lab.beforeEach(() => {
  fakeConfigurationData = {
    title: 'CONFIG_KEY',
    value: 'CONFIG_VALUE'
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(Configuration, 'listBy').value(() => [new Configuration(fakeConfigurationData)])
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Configuration Entity tests:', () => {
  lab.test('getValue() method returns the correct configuration value', async () => {
    const value = await Configuration.getValue(context, fakeConfigurationData.title)
    Code.expect(value).to.equal(fakeConfigurationData.value)
  })
})
