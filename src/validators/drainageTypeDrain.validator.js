'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')

module.exports = class DrainageTypeDrainValidator extends BaseValidator {
  get errorMessages () {
    return {
      'drainage-type': {
        'any.empty': 'Select where the area drains to',
        'any.required': 'Select where the area drains to'
      }
    }
  }

  get formValidators () {
    return {
      'drainage-type': Joi
        .string()
        .required()
    }
  }
}
