'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')

const Validator = require('../../src/validators/wasteActivity.validator')

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

lab.experiment('Waste activity validator tests:', () => {
  lab.test('activity', async () => {
    const validator = new Validator()
    const validation = validator.formValidators.activity
    const errorMessages = validator.errorMessages.activity

    checkValidation(validation, errorMessages, undefined, 'Select at least one activity')
    checkValidation(validation, errorMessages, '', 'Select at least one activity')
    checkValidation(validation, errorMessages, 'x')
  })
})