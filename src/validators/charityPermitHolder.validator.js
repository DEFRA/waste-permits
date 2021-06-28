'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')

module.exports = class CharityPermitHolderValidator extends BaseValidator {
  get errorMessages () {
    return {
      'charity-permit-holder-type': {
        'any.required': 'Select the permit holder'
      }
    }
  }

  get formValidators () {
    return {
      'charity-permit-holder-type': Joi.string().required()
    }
  }
}
