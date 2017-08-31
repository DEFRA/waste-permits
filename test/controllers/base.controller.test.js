'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

const BaseController = require('../../src/controllers/base.controller')

lab.beforeEach((done) => {
  done()
})

lab.afterEach((done) => {
  done()
})

lab.experiment('Base Controller tests:', () => {
  lab.test('createPageContext() method builds page context object correctly', (done) => {
    const pageHeading = 'THE_PAGE_HEADING'
    const pageTitle = 'THE_PAGE_HEADING - Waste Permits - GOV.UK'

    const pageContext = BaseController.createPageContext(pageHeading)

    Code.expect(pageContext.pageHeading).to.equal(pageHeading)
    Code.expect(pageContext.pageTitle).to.equal(pageTitle)
    done()
  })
})
