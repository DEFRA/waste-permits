'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')

module.exports = class WasteWeightValidator extends BaseValidator {
  get errorMessages () {
    return {
      'non-hazardous-throughput': {
        'any.required': 'Enter a weight',
        'string.max': 'Enter the weight using no more than 20 characters'
      },
      'non-hazardous-maximum': {
        'any.required': 'Enter a weight',
        'string.max': 'Enter the weight using no more than 20 characters'
      },
      'hazardous-throughput': {
        'any.required': 'Enter a weight',
        'string.max': 'Enter the weight using no more than 20 characters'
      },
      'hazardous-maximum': {
        'any.required': 'Enter a weight',
        'string.max': 'Enter the weight using no more than 20 characters'
      }
    }
  }

  get formValidators () {
    return Joi.object({
      'non-hazardous-throughput': Joi.string().max(20).required(),
      'non-hazardous-maximum': Joi.string().max(20).required(),
      'has-hazardous': Joi.string(),
      'hazardous-throughput': Joi.string()
        .when('has-hazardous', {
          is: Joi.exist(),
          then: Joi.string().max(20).required()
        }),
      'hazardous-maximum': Joi.string()
        .when('has-hazardous', {
          is: Joi.exist(),
          then: Joi.string().max(20).required()
        })
    })
  }
}
