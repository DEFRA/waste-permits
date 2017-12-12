'use strict'

// TODO remove this?
// const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class DirectorDateOfBirthValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      // 'director-dob-day-0': {
      //   'any.empty': `Enter a date of birth for <directorname>`,
      //   'any.required': `Enter a date of birth for <directorname>`
      // }
      // 'director-dobs-not-entered': {
      //   'any.required': `Enter a date of birth`
      // },
      // 'director-dob-day-x': {
      //   'any.empty': `Enter a date of birth for ##DIRECTOR_NAME##`,
      //   'any.required': `Enter a date of birth for ##DIRECTOR_NAME##`
      // },
      // 'invalid-date': {
      //   'any.invalid': `Enter a day between 1 and ##MONTH_LENGTH##`
      // }
    }

    // this.errorMessages = this.errorMessages.bind(this)
  }

  setErrorMessages () {
    console.log('set error messages')
    this.errorMessages = {
      'director-dobs-not-entered': {
        'any.required': `Enter a date of birth`
      },
      'director-dob-day-0': {
        'any.empty': `Enter a date of birth for ##DIRECTOR_NAME##`,
        'any.required': `Enter a date of birth for ##DIRECTOR_NAME##`
      },
      'invalid-date': {
        'any.invalid': `Enter a day between 1 and ##MONTH_LENGTH##`
      }
    }
  }

  getFormValidators () {
    return {
      // 'director-dob-day-0': Joi
      //   .string()
      //   .required()
    }
  }
}
