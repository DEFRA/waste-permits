'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')

const Validator = require('../../src/validators/listHazWasteProcedures.validator')

const checkValidation = function (definedValidation, definedErrorMessages, valueToValidate, expectedErrorMessage) {
  const validationResult = definedValidation.validate(valueToValidate)
  if (expectedErrorMessage) {
    Code.expect(validationResult.error).to.exist()
    const errorType = validationResult.error.details[0].type
    const errorMessage = definedErrorMessages[errorType]
    Code.expect(errorMessage).to.equal(expectedErrorMessage)
  } else {
    Code.expect(validationResult.error).to.not.exist()
  }
}

lab.experiment('List hazardous waste procedures validator tests:', () => {
  lab.test('procedures-list', async () => {
    const validator = new Validator()
    const validation = validator.formValidators['procedures-list']
    const errorMessages = validator.errorMessages['procedures-list']

    checkValidation(validation, errorMessages, undefined, 'List the procedures you will use')
    checkValidation(validation, errorMessages, '', 'List the procedures you will use')
    checkValidation(validation, errorMessages, 'X'.repeat(501), 'Enter a list with no more than 500 characters')
    checkValidation(validation, errorMessages, 'Some procedures')
  })
})