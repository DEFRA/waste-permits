'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')

const MAX_LENGTH = 20

const ERROR_MESSAGES = {
  'any.required': 'You must enter a number',
  'string.max': `You can enter up to ${MAX_LENGTH} characters`,
  'number.base': 'The weight must be a number',
  'number.unsafe': 'Enter the weight between 0 and 99999999'
}
const JOI_WEIGHT = Joi.number().max(999999).required()

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
      'hazardous-throughput': Joi.number().when('has-hazardous', { is: Joi.exist(), then: JOI_WEIGHT }),
      'hazardous-maximum': Joi.number().when('has-hazardous', { is: Joi.exist(), then: JOI_WEIGHT })
    })
  }
}
