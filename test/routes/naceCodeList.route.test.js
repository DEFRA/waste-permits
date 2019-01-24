'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const GeneralTestHelper = require('./generalTestHelper.test')

const routePath = '/information/nace-codes'

let getRequest

lab.beforeEach(() => {
  getRequest = {
    method: 'GET',
    url: routePath,
    headers: {}
  }
})

lab.experiment('NACE code list page tests:', () => {
  lab.test(`GET ${routePath} returns the NACE code list page correctly`, async () => {
    const doc = await GeneralTestHelper.getDoc(getRequest)

    Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('List of NACE codes for medium combustion plant and specified generators')
  })
})
