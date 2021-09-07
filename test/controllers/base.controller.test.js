'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')

const BaseController = require('../../src/controllers/base.controller')

lab.experiment('Base Controller tests:', () => {
  lab.test('createPageContext() method builds page context object correctly', () => {
    const route = {
      pageHeading: 'THE_PAGE_HEADING',
      pageTitle: 'THE_PAGE_HEADING - Apply for an environmental permit - GOV.UK',
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

  lab.experiment('Handles form parameters as arrays:', () => {
    lab.test('for array', () => {
      const result = BaseController.getMultivalueFormValueAsArray(['a', 'b'])
      Code.expect(result).to.equal(['a', 'b'])
    })
    lab.test('for comma-separated string', () => {
      const result = BaseController.getMultivalueFormValueAsArray('a,b')
      Code.expect(result).to.equal(['a', 'b'])
    })
    lab.test('for single string', () => {
      const result = BaseController.getMultivalueFormValueAsArray('a')
      Code.expect(result).to.equal(['a'])
    })
    lab.test('for non-text value', () => {
      const result = BaseController.getMultivalueFormValueAsArray(1)
      Code.expect(result).to.equal([1])
    })
    lab.test('for empty value', () => {
      const result = BaseController.getMultivalueFormValueAsArray('')
      Code.expect(result).to.equal([])
    })
    lab.test('for missing value', () => {
      const result = BaseController.getMultivalueFormValueAsArray()
      Code.expect(result).to.equal([])
    })
  })
})
