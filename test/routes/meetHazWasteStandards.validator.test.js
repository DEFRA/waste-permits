'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')

const Validator = require('../../src/validators/meetHazWasteStandards.validator')

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

lab.experiment('Meet hazardous waste standards validator tests:', () => {
  lab.test('meet-standards', async () => {
    const validator = new Validator()
    const validation = validator.formValidators['meet-standards']
    const errorMessages = validator.errorMessages['meet-standards']

    checkValidation(validation, errorMessages, undefined, 'Say if you will meet the standards for managing hazardous waste')
    checkValidation(validation, errorMessages, '', 'Say if you will meet the standards for managing hazardous waste')
    checkValidation(validation, errorMessages, 'invalid', 'Say if you will meet the standards for managing hazardous waste')
    checkValidation(validation, errorMessages, 'yes')
    checkValidation(validation, errorMessages, 'no')
  })
})