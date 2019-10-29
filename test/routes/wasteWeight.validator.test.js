'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')

const Validator = require('../../src/validators/wasteWeight.validator')

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

lab.experiment('Waste weight validator tests:', () => {
  let validator
  let valueToValidate

  lab.beforeEach(() => {
    validator = new Validator()
    valueToValidate = {
      'non-hazardous-throughput': '1',
      'non-hazardous-maximum': '2',
      'has-hazardous': 'true',
      'hazardous-throughput': '3',
      'hazardous-maximum': '4'
    }
  })
  lab.test('a weight is blank', async () => {
    valueToValidate['non-hazardous-throughput'] = undefined
    checkValidation(validator.formValidators, validator.errorMessages['non-hazardous-throughput'], valueToValidate, 'Enter a weight')
  })
  lab.test('a weight is too long', async () => {
    valueToValidate['non-hazardous-throughput'] = '01234567890123456789X'
    checkValidation(validator.formValidators, validator.errorMessages['non-hazardous-throughput'], valueToValidate, 'Enter the weight using no more than 20 characters')
  })
  lab.test('a hazardous weight is blank', async () => {
    valueToValidate['hazardous-throughput'] = undefined
    checkValidation(validator.formValidators, validator.errorMessages['hazardous-throughput'], valueToValidate, 'Enter a weight')
  })
  lab.test('all values are correctly provided', async () => {
    checkValidation(validator.formValidators, null, valueToValidate)
  })
  lab.test('all values are correctly provided - non-hazardous only', async () => {
    delete valueToValidate['has-hazardous']
    delete valueToValidate['hazardous-throughput']
    delete valueToValidate['hazardous-maximum']
    checkValidation(validator.formValidators, null, valueToValidate)
  })
})