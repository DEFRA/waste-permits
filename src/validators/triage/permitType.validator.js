'use strict'

const Joi = require('joi')
const BaseValidator = require('../base.validator')

module.exports = class BespokeOrStandardRulesValidator extends BaseValidator {
  get errorMessages () {
    return {
      'permit-type': {
        'any.required': `Select the type of permit you want`
      }
    }
  }

  get formValidators () {
    return {
      'permit-type': Joi.string().required()
    }
  }
}
