'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')

const BaseValidator = require('../../src/validators/base.validator')

class TestValidator extends BaseValidator {
  constructor (options) {
    super()
    this.validatorOptions = options
  }

  get errorMessages () {
    return {
      telephone: {
        'any.empty': 'Enter a telephone number',
        'any.required': 'Enter a telephone number',
        min: 'Enter a telephone number with at least 6 numbers',
        'custom.invalid': 'Telephone number is invalid',
        'custom.test': 'Telephone Test failed',
        'custom.async.test': 'Telephone Test failed asynchronously'
      }
    }
  }

  get customValidators () {
    return {
      telephone: {
        'custom.invalid': () => true,
        'custom.test': () => true,
        'custom.async.test': () => Promise.resolve(true)
      }
    }
  }
}

const checkErrorMessages = (fieldName, errorMessages) => {
  const validator = new TestValidator()
  const pageContext = {}

  const validationErrors = {
    details: errorMessages.map(({ type }) => ({ path: [fieldName], type: type }))
  }

  validator.addErrorsToPageContext(validationErrors, pageContext)
  const errors = {}
  errors[fieldName] = errorMessages.map(({ message }) => message)
  const errorList = errorMessages.map(({ message }) => ({ fieldName, message }))

  Code.expect(pageContext.errors).to.equal(errors)
  Code.expect(pageContext.errorList).to.equal(errorList)
}

lab.experiment('Base Validator tests:', () => {
  lab.experiment('addErrorsToPageContext() method', () => {
    lab.test('adds "Unable to find error messages" error to page context object correctly', () => {
      checkErrorMessages('unknown', [
        {
          type: undefined,
          message: 'Unable to find error messages for field: unknown'
        }
      ])
    })

    lab.test('adds "Validation message not found" error to page context object correctly', () => {
      checkErrorMessages('telephone', [
        {
          type: 'unknown.type',
          message: 'Validation message not found... Field: telephone, Error Type: unknown.type'
        }
      ])
    })

    lab.test('adds a single error message to the page context object correctly for a fieldName', () => {
      checkErrorMessages('telephone', [
        {
          type: 'custom.invalid',
          message: 'Telephone number is invalid'
        }
      ])
    })

    lab.test('adds a multiple error message to the page context object correctly for a fieldName', () => {
      checkErrorMessages('telephone', [
        {
          type: 'custom.invalid',
          message: 'Telephone number is invalid'
        },
        {
          type: 'custom.test',
          message: 'Telephone Test failed'
        }
      ])
    })
  })

  lab.experiment('customValidate() method', () => {
    lab.test('will validate even if a required error exists for that field', async () => {
      const validator = new TestValidator()
      const request = {
        payload: {
          telephone: '++++'
        }
      }
      const errors = [{ path: ['telephone'], type: 'min', message: 'Too small' }]
      const updatedErrors = await validator.customValidate(request, { details: errors })
      Code.expect(updatedErrors).to.equal({
        details: [
          { path: ['telephone'], type: 'min', message: 'Too small' },
          { path: ['telephone'], type: 'custom.invalid', message: 'Telephone number is invalid' },
          { path: ['telephone'], type: 'custom.test', message: 'Telephone Test failed' },
          { path: ['telephone'], type: 'custom.async.test', message: 'Telephone Test failed asynchronously' }
        ]
      })
    })

    lab.test('will not validate if a required error exists for that field', async () => {
      const validator = new TestValidator()
      const request = {
        payload: {
          telephone: '++++'
        }
      }
      const errors = [{ path: ['telephone'], type: 'any.required', message: 'Telephone required' }]
      const updatedErrors = await validator.customValidate(request, { details: errors })
      Code.expect(updatedErrors).to.equal({ details: errors })
    })
  })
})
