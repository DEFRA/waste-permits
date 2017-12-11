'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class DirectorDateOfBirthValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'director-dob-day-0': {
        'any.empty': `Enter a date of birth for <directorname>`,
        'any.required': `Enter a date of birth for <directorname>`
      }
    }
  }

  static getFormValidators () {
    return {
      'director-dob-day-0': Joi
        .string()
        .required()
    }
  }
}
