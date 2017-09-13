'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const ServerLoggingService = require('../../src/services/serverLogging.service')
const server = require('../../server')

lab.beforeEach((done) => {
  done()
})

lab.afterEach((done) => {
  done()
})

lab.experiment('Server logging:', () => {
  lab.test('Error messages are logged', (done) => {
    const spy = sinon.spy(server, 'log')

    ServerLoggingService.logError('An error has occurred')
    Code.expect(spy.calledOnce).to.equal(true)
    Code.expect(spy.calledWith('ERROR', 'An error has occurred')).to.equal(true)
    Code.expect(spy.threw()).to.equal(false)

    server.log.restore()
    done()
  })

  lab.test('Info messages are logged', (done) => {
    const spy = sinon.spy(server, 'log')

    ServerLoggingService.logInfo('Something has happened')
    Code.expect(spy.calledOnce).to.equal(true)
    Code.expect(spy.calledWith('INFO', 'Something has happened')).to.equal(true)
    Code.expect(spy.threw()).to.equal(false)

    server.log.restore()
    done()
  })
})
