'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const Controller = require('../../src/controllers/wasteWeights.controller')

lab.experiment('Waste weights controller tests:', () => {
  let sandbox
  let controller
  let redirectSpy

  lab.beforeEach(() => {
    controller = new Controller({ route: {} })

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()
    redirectSpy = sandbox.stub(Controller.prototype, 'redirect')
  })

  lab.afterEach(() => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.test('GET redirects', async () => {
    await controller.doGet()
    Code.expect(redirectSpy.called).to.be.true()
    Code.expect(redirectSpy.args[0][0].path).to.equal('/waste-weight/0')
  })
})
