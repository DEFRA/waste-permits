'use strict'

const Constants = require('../../constants')
const BaseValidator = require('../base.validator')

const {EMAIL_VALID_REGEX} = Constants.Validation

module.exports = class SaveAndReturnConfirmValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'got-email': {
        'custom.required': `Select you got the email or can’t find it`
      },
      'save-and-return-email': {
        'custom.required': `Enter an email address`,
        'custom.invalid': `Enter a valid email address`
      }
    }
  }

  customValidators () {
    return {
      'got-email': {
        'custom.required': (value, {'is-complete': isComplete}) => isComplete !== 'true' && !value
      },
      'save-and-return-email': {
        'custom.required': (value, {'got-email': gotEmail}) => gotEmail === 'false' ? !value : false,
        'custom.invalid': (value, {'got-email': gotEmail}) => gotEmail === 'false' && Boolean(value) ? !(EMAIL_VALID_REGEX).test(value) : false
      }
    }
  }
}
