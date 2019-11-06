'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const BaseController = require('../../src/controllers/base.controller')
const Controller = require('../../src/controllers/wasteWeight.controller')

const RecoveryService = require('../../src/services/recovery.service')
const WasteWeights = require('../../src/models/wasteWeights.model')

lab.experiment('Waste weight controller tests:', () => {
  let sandbox
  let controller
  let getForActivityStub
  let showViewSpy

  lab.beforeEach(() => {
    controller = new Controller({ route: {} })

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()
    sandbox.stub(RecoveryService, 'createApplicationContext').resolves({})
    sandbox.stub(BaseController.prototype, 'createPageContext').returns({})
    getForActivityStub = sandbox.stub(WasteWeights, 'getForActivity')
    getForActivityStub.resolves({})
    showViewSpy = sandbox.stub(Controller.prototype, 'showView')
  })

  lab.afterEach(() => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('GET:', () => {
    let getRequest = { params: { activityIndex: 0 } }

    lab.test('GET returns a view', async () => {
      showViewSpy.returns(true)
      const returnValue = await controller.doGet(getRequest)
      Code.expect(showViewSpy.called).to.be.true()
      Code.expect(returnValue).to.be.true()
    })

    lab.test('GET supplies correct page title to view', async () => {
      getForActivityStub.resolves({ activityDisplayName: 'Fake activity' })
      await controller.doGet(getRequest)
      const pageContext = showViewSpy.args[0][0].pageContext
      Code.expect(pageContext).to.exist()
      Code.expect(pageContext.pageHeading).to.equal('Enter the waste weights for Fake activity')
      Code.expect(pageContext.pageTitle).to.startWith('Enter the waste weights for Fake activity')
    })

    lab.test('GET supplies correct non-hazardous weights to view', async () => {
      getForActivityStub.resolves({
        activityDisplayName: 'Fake activity',
        hasHazardousWaste: false,
        nonHazardousThroughput: 'A',
        nonHazardousMaximum: 'B'
      })
      await controller.doGet(getRequest)
      const pageContext = showViewSpy.args[0][0].pageContext
      Code.expect(pageContext).to.exist()
      Code.expect(pageContext.hasHazardousWaste).to.be.false()
      Code.expect(pageContext.formValues['non-hazardous-throughput']).to.equal('A')
      Code.expect(pageContext.formValues['non-hazardous-maximum']).to.equal('B')
    })

    lab.test('GET supplies correct hazardous weights to view', async () => {
      getForActivityStub.resolves({
        activityDisplayName: 'Fake activity',
        hasHazardousWaste: true,
        hazardousThroughput: 'A',
        hazardousMaximum: 'B'
      })
      await controller.doGet(getRequest)
      const pageContext = showViewSpy.args[0][0].pageContext
      Code.expect(pageContext).to.exist()
      Code.expect(pageContext.hasHazardousWaste).to.be.true()
      Code.expect(pageContext.formValues['hazardous-throughput']).to.equal('A')
      Code.expect(pageContext.formValues['hazardous-maximum']).to.equal('B')
    })

    lab.test('GET supplies provided values to view when there are errors', async () => {
      getRequest.payload = 'payload'
      await controller.doGet(getRequest, undefined, 'errors')
      const pageContext = showViewSpy.args[0][0].pageContext
      Code.expect(pageContext).to.exist()
      Code.expect(pageContext.formValues).to.equal('payload')
    })

    lab.test('GET errors for missing activity index', async () => {
      let error
      delete getRequest.params.activityIndex
      try {
        await controller.doGet(getRequest)
      } catch (e) {
        error = e
      }
      Code.expect(error).to.exist()
      Code.expect(error.message).to.equal('Invalid activity')
    })

    lab.test('GET errors for invalid activity index', async () => {
      let error
      getRequest.params.activityIndex = 99
      getForActivityStub.resolves(undefined)
      try {
        await controller.doGet(getRequest)
      } catch (e) {
        error = e
      }
      Code.expect(error).to.exist()
      Code.expect(error.message).to.equal('Invalid activity')
    })
  })

  lab.experiment('POST:', () => {
    let postRequest = {
      params: { activityIndex: 0 },
      payload: {
        'non-hazardous-throughput': '1',
        'non-hazardous-maximum': '2',
        'has-hazardous': 'true',
        'hazardous-throughput': '3',
        'hazardous-maximum': '4'
      }
    }
    let redirectSpy
    let saveSpy
    lab.beforeEach(() => {
      redirectSpy = sandbox.stub(Controller.prototype, 'redirect')
      saveSpy = sandbox.stub(WasteWeights.prototype, 'save')
      getForActivityStub.resolves(new WasteWeights())
    })

    lab.test('POST sets non-hazardous weights and saves', async () => {
      const wasteWeights = new WasteWeights()
      wasteWeights.hasHazardousWaste = false
      getForActivityStub.resolves(wasteWeights)
      await controller.doPost(postRequest)
      Code.expect(wasteWeights.nonHazardousThroughput).to.equal('1')
      Code.expect(wasteWeights.nonHazardousMaximum).to.equal('2')
      Code.expect(saveSpy.called).to.be.true()
    })

    lab.test('POST sets hazardous weights and saves', async () => {
      const wasteWeights = new WasteWeights()
      wasteWeights.hasHazardousWaste = true
      getForActivityStub.resolves(wasteWeights)
      await controller.doPost(postRequest)
      Code.expect(wasteWeights.hazardousThroughput).to.equal('3')
      Code.expect(wasteWeights.hazardousMaximum).to.equal('4')
      Code.expect(saveSpy.called).to.be.true()
    })

    lab.test('POST redirects to default next path', async () => {
      await controller.doPost(postRequest)
      Code.expect(redirectSpy.called).to.be.true()
      Code.expect(redirectSpy.args[0][0].path).to.not.exist()
    })

    lab.test('POST redirects to next set of weights if there are more activities', async () => {
      getForActivityStub.resolves(new WasteWeights({ hasNext: true }))
      await controller.doPost(postRequest)
      Code.expect(redirectSpy.called).to.be.true()
      Code.expect(redirectSpy.args[0][0].path).to.equal('/waste-weight/1')
    })

    lab.test('POST errors for missing activity index', async () => {
      let error
      delete postRequest.params.activityIndex
      getForActivityStub.resolves(undefined)
      try {
        await controller.doPost(postRequest)
      } catch (e) {
        error = e
      }
      Code.expect(error).to.exist()
      Code.expect(error.message).to.equal('Invalid activity')
    })

    lab.test('POST errors for invalid activity index', async () => {
      let error
      postRequest.params.activityIndex = 99
      getForActivityStub.resolves(undefined)
      try {
        await controller.doPost(postRequest)
      } catch (e) {
        error = e
      }
      Code.expect(error).to.exist()
      Code.expect(error.message).to.equal('Invalid activity')
    })
  })
})
