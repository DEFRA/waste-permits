'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const BaseController = require('../../src/controllers/base.controller')
const Controller = require('../../src/controllers/wasteRecoveryCodes.controller')

const RecoveryService = require('../../src/services/recovery.service')
const WasteDisposalAndRecoveryCodes = require('../../src/models/wasteDisposalAndRecoveryCodes.model')

lab.experiment('Waste recovery codes controller tests:', () => {
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
    getForActivityStub = sandbox.stub(WasteDisposalAndRecoveryCodes, 'getForActivity')
    getForActivityStub.resolves({})
    showViewSpy = sandbox.stub(Controller.prototype, 'showView')
  })

  lab.afterEach(() => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('GET:', () => {
    const getRequest = { params: { activityIndex: 0 } }

    lab.test('GET returns a view', async () => {
      showViewSpy.returns(true)
      const returnValue = await controller.doGet(getRequest)
      Code.expect(showViewSpy.called).to.be.true()
      Code.expect(returnValue).to.be.true()
    })

    lab.test('GET supplies correct information to view', async () => {
      getForActivityStub.resolves({ activityDisplayName: 'Fake activity', wasteRecoveryCodeList: 'Fake list' })
      await controller.doGet(getRequest)
      const pageContext = showViewSpy.args[0][0].pageContext
      Code.expect(pageContext).to.exist()
      Code.expect(pageContext.pageHeading).to.equal('Select the recovery codes for Fake activity')
      Code.expect(pageContext.pageTitle).to.startWith('Select the recovery codes for Fake activity')
      Code.expect(pageContext.codeList).to.equal('Fake list')
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
    let postRequest
    let redirectSpy
    let setSpy
    let saveSpy
    lab.beforeEach(() => {
      postRequest = { params: { activityIndex: 0 }, payload: { code: ['r01', 'r02'] } }
      redirectSpy = sandbox.stub(Controller.prototype, 'redirect')
      setSpy = sandbox.stub(WasteDisposalAndRecoveryCodes.prototype, 'setWasteRecoveryCodes')
      saveSpy = sandbox.stub(WasteDisposalAndRecoveryCodes.prototype, 'save')
      getForActivityStub.resolves(new WasteDisposalAndRecoveryCodes({ selectedWasteDisposalCodes: ['d01'] }))
    })

    lab.test('POST sets the selected codes and saves', async () => {
      await controller.doPost(postRequest)
      Code.expect(setSpy.called).to.be.true()
      Code.expect(setSpy.args[0][0]).to.equal(['r01', 'r02'])
      Code.expect(saveSpy.called).to.be.true()
    })

    lab.test('POST still works with old-style concatenated values', async () => {
      postRequest.payload.code = 'r01,r02'
      await controller.doPost(postRequest)
      Code.expect(setSpy.called).to.be.true()
      Code.expect(setSpy.args[0][0]).to.equal(['r01', 'r02'])
      Code.expect(saveSpy.called).to.be.true()
    })

    lab.test('POST sets no selected codes and saves', async () => {
      delete postRequest.payload.code
      await controller.doPost(postRequest)
      Code.expect(setSpy.called).to.be.true()
      Code.expect(setSpy.args[0][0]).to.equal([])
      Code.expect(saveSpy.called).to.be.true()
    })

    lab.test('POST redirects to default next path', async () => {
      await controller.doPost(postRequest)
      Code.expect(redirectSpy.called).to.be.true()
      Code.expect(redirectSpy.args[0][0].path).to.not.exist()
    })

    lab.test('POST redirects to next set of disposal codes if there are more activities', async () => {
      getForActivityStub.resolves(new WasteDisposalAndRecoveryCodes({ selectedWasteDisposalCodes: ['d01'], hasNext: true }))
      await controller.doPost(postRequest)
      Code.expect(redirectSpy.called).to.be.true()
      Code.expect(redirectSpy.args[0][0].path).to.equal('/recovery-disposal/disposal/1')
    })

    lab.test('POST doesn\'t redirect if no disposal or recovery codes selected', async () => {
      getForActivityStub.resolves(new WasteDisposalAndRecoveryCodes({}))
      const doGetSpy = sandbox.stub(Controller.prototype, 'doGet')
      postRequest = { params: { activityIndex: 0 }, payload: {} }
      await controller.doPost(postRequest)
      Code.expect(redirectSpy.called).to.be.false()
      Code.expect(doGetSpy.called).to.be.true()
      const calledErrors = doGetSpy.args[0][2]
      Code.expect(calledErrors).to.exist()
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
