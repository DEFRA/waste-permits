'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const GeneralTestHelper = require('./generalTestHelper.test')

const routePath = '/health'

const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {},
  payload: {}
}

lab.beforeEach(() => {

})

lab.afterEach(() => {

})

lab.experiment('Health page tests:', () => {
  lab.test('The page should NOT have a back link', async () => {
    const doc = await GeneralTestHelper.getDoc(getRequest)

    const element = doc.getElementById('back-link')
    Code.expect(element).to.not.exist()
  })

  lab.test(`GET ${routePath} returns the health page correctly`, async () => {
    const doc = await GeneralTestHelper.getDoc(getRequest)

    let element = doc.getElementById('page-heading').firstChild
    Code.expect(element.nodeValue).to.equal('Apply for an environmental permit')

    element = doc.getElementById('health-application-version').firstChild
    Code.expect(element).to.exist()

    element = doc.getElementById('health-application-commit-ref').firstChild
    Code.expect(element).to.exist()
  })
})
