'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

const BaseValidator = require('../../src/validators/base.validator')

lab.beforeEach(() => {

})

lab.afterEach(() => {

})

lab.experiment('Base Validator tests:', () => {
  lab.test('addErrorsToPageContext() method adds errors to page context object correctly', () => {
    const validator = new BaseValidator()
    const errors = {}
    const errorList = []

    const pageContext = {}

    const validationErrors = {
      data: {
        details: errorList.map(() => ({path: ''}))
      }
    }

    validator.addErrorsToPageContext(validationErrors, pageContext)

    Code.expect(pageContext.errors).to.equal(errors)
    Code.expect(pageContext.errorList).to.equal(errorList)
  })
})
