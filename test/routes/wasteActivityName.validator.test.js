'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')

const Validator = require('../../src/validators/wasteActivityName.validator')

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

lab.experiment('Duplicate waste activity name validator tests:', () => {
  lab.test('an activity-name is blank', async () => {
    const validator = new Validator()
    const validation = validator.formValidators
    const errorMessages = validator.errorMessages['activity-name-1']

    checkValidation(validation, errorMessages, { 'activity-name-1': undefined, 'activity-name-2': 'A short name' }, 'Enter a short name')
    checkValidation(validation, errorMessages, { 'activity-name-1': '', 'activity-name-2': 'A short name' }, 'Enter a short name')
  })
  lab.test('activity-name values are provided', async () => {
    const validator = new Validator()
    const validation = validator.formValidators
    const errorMessages = validator.errorMessages['activity-name-1']

    checkValidation(validation, errorMessages, { 'activity-name-1': 'A short name', 'activity-name-2': 'A short name' })
  })
})
