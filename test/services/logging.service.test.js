'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const LoggingService = require('../../src/services/logging.service')
const server = require('../../server')

let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()
  sandbox.stub(console, 'error').value(() => {})
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('LoggingService tests: Server logging:', () => {
  lab.test('Error messages are logged', () => {
    const spy = sandbox.spy(server, 'log')

    LoggingService.logError('An error has occurred')
    Code.expect(spy.calledOnce).to.equal(true)
    Code.expect(spy.calledWith('ERROR', 'An error has occurred')).to.equal(true)
    Code.expect(spy.threw()).to.equal(false)

    server.log.restore()
  })

  lab.test('Info messages are logged', () => {
    const spy = sandbox.spy(server, 'log')

    LoggingService.logInfo('Something has happened')
    Code.expect(spy.calledOnce).to.equal(true)
    Code.expect(spy.calledWith('INFO', 'Something has happened')).to.equal(true)
    Code.expect(spy.threw()).to.equal(false)

    server.log.restore()
  })
})

lab.experiment('LoggingService tests: Request logging:', () => {
  lab.test('Error messages are logged', () => {
    const request = {
      log: () => {}
    }
    const spy = sandbox.spy(request, 'log')

    LoggingService.logError('An error has occurred', request)
    Code.expect(spy.calledOnce).to.equal(true)
    Code.expect(spy.calledWith('ERROR', 'An error has occurred')).to.equal(true)
    Code.expect(spy.threw()).to.equal(false)
  })

  lab.test('Info messages are logged', () => {
    const request = {
      log: () => {}
    }
    const spy = sandbox.spy(request, 'log')

    LoggingService.logInfo('Something has happened', request)
    Code.expect(spy.calledOnce).to.equal(true)
    Code.expect(spy.calledWith('INFO', 'Something has happened')).to.equal(true)
    Code.expect(spy.threw()).to.equal(false)
  })
})
