'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')

const BaseController = require('../../src/controllers/base.controller')

lab.experiment('Base Controller tests:', () => {
  lab.test('createPageContext() method builds page context object correctly', () => {
    const route = {
      pageHeading: 'THE_PAGE_HEADING',
      pageTitle: 'THE_PAGE_HEADING - Apply for a standard rules environmental permit - GOV.UK',
      path: 'THE_ROUTE_PATH'
    }

    const plugins = {
      scooter: {
        family: 'IE'
      }
    }

    const controller = new BaseController({ route })

    const pageContext = controller.createPageContext({ request: { path: route.path, plugins } })

    Code.expect(pageContext.pageHeading).to.equal(route.pageHeading)
    Code.expect(pageContext.pageTitle).to.equal(route.pageTitle)
    Code.expect(pageContext.formAction).to.equal(route.path)
    Code.expect(pageContext.browserIsIE).to.equal(true)
  })
})
