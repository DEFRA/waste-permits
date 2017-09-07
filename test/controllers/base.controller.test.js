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
    const route = {
      pageHeading: 'THE_PAGE_HEADING',
      pageTitle: 'THE_PAGE_HEADING - Waste Permits - GOV.UK',
      path: 'THE_ROUTE_PATH'
    }

    const pageContext = BaseController.createPageContext(route)

    Code.expect(pageContext.pageHeading).to.equal(route.pageHeading)
    Code.expect(pageContext.pageTitle).to.equal(route.pageTitle)
    Code.expect(pageContext.formAction).to.equal(route.path)
    done()
  })
})
