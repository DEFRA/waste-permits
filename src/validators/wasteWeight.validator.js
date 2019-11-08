'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')

const ERROR_MESSAGES = {
  'any.required': 'You must enter a number',
  'string.max': 'You\'ve entered too many characters'
}
const JOI_WEIGHT = Joi.string().max(20).required()

module.exports = class WasteWeightValidator extends BaseValidator {
  get errorMessages () {
    return {
      'non-hazardous-throughput': ERROR_MESSAGES,
      'non-hazardous-maximum': ERROR_MESSAGES,
      'hazardous-throughput': ERROR_MESSAGES,
      'hazardous-maximum': ERROR_MESSAGES
    }
  }

  get formValidators () {
    return Joi.object({
      'non-hazardous-throughput': JOI_WEIGHT,
      'non-hazardous-maximum': JOI_WEIGHT,
      'has-hazardous': Joi.string(),
      'hazardous-throughput': Joi.string().when('has-hazardous', { is: Joi.exist(), then: JOI_WEIGHT }),
      'hazardous-maximum': Joi.string().when('has-hazardous', { is: Joi.exist(), then: JOI_WEIGHT })
    })
  }
}
