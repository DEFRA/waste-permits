'use strict'

const BaseValidator = require('./base.validator')

module.exports = class WasteActivityValidator extends BaseValidator {
  get errorMessages () {
    return {
      code: {
        'custom.required': 'Select either a disposal or a recovery code for this activity. To add a disposal code, go back to the previous screen.'
      }
    }
  }

  get formValidators () {
    return {}
  }
}
