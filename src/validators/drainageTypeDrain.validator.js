'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class DrainageTypeDrainValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'drainage-type': {
        'any.empty': 'Select where the area drains to',
        'any.required': 'Select where the area drains to'
      }
    }
  }

  getFormValidators () {
    return {
      'drainage-type': Joi
        .string()
        .required()
    }
  }
}
