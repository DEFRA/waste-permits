'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')

const activityNameMessages = function () {
  return {
    'any.empty': 'Enter a short name',
    'any.required': 'Enter a short name',
    'string.max': `Enter a shorter name with no more than 70 characters`
  }
}

module.exports = class WasteActivityNameValidator extends BaseValidator {
  get errorMessages () {
    const messages = {}
    for (let i = 0; i < 50; i++) {
      Object.defineProperty(messages, 'activity-name-' + i, { get: activityNameMessages })
    }
    return messages
  }

  get formValidators () {
    return Joi.object()
      .pattern(/activity-name-\d+/,
        Joi
          .string()
          .required()
          .max(70)
      )
  }
}
