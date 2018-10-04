'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const config = require('../../src/config/config')

const LoggingService = require('../../src/services/logging.service')

let sandbox
let spy

lab.beforeEach(() => {
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()
  spy = sandbox.spy(LoggingService, '_log')
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  LoggingService._log.restore()
  sandbox.restore()
})

lab.experiment('LoggingService tests:', () => {
  lab.test('When LOG_LEVEL is ERROR', async () => {
    sandbox.stub(config, 'LOG_LEVEL').value('ERROR')

    LoggingService.logError('An error has occurred')
    Code.expect(spy.calledWith('ERROR', 'An error has occurred')).to.equal(true)

    LoggingService.logInfo('Something has happened')
    Code.expect(spy.calledWith('INFO', 'Something has happened')).to.equal(true)

    LoggingService.logDebug('Need a closer look')
    Code.expect(spy.calledWith('DEBUG', 'Need a closer look')).to.equal(false)

    Code.expect(spy.threw()).to.equal(false)
  })

  lab.test('When LOG_LEVEL is DEBUG', async () => {
    sandbox.stub(config, 'LOG_LEVEL').value('DEBUG')

    LoggingService.logError('An error has occurred')
    Code.expect(spy.calledWith('ERROR', 'An error has occurred')).to.equal(true)

    LoggingService.logInfo('Something has happened')
    Code.expect(spy.calledWith('INFO', 'Something has happened')).to.equal(true)

    LoggingService.logDebug('Need a closer look')
    Code.expect(spy.calledWith('DEBUG', 'Need a closer look')).to.equal(true)

    Code.expect(spy.threw()).to.equal(false)
  })
})
