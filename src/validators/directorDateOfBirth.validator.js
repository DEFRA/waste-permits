'use strict'

const moment = require('moment')
const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class DirectorDateOfBirthValidator extends BaseValidator {
  setErrorMessages (directors) {
    this.errorMessages = {
      'director-dobs-not-entered': {
        'any.required': `Enter a date of birth`
      }
    }
    // Iterate the directors and build error messages for each one
    for (let i = 0; i < directors.length; i++) {
      const director = directors[i]
      let daysInBirthMonth = 31
      if (director.dob && director.dob.month && director.dob.year) {
        daysInBirthMonth = moment(`${director.dob.year}-${director.dob.month}`, 'YYYY-MM').daysInMonth()
      }
      const directorName = `${director.firstName} ${director.lastName}`

      this.errorMessages[`director-dob-day-${i}`] = {
        'any.required': `Enter a date of birth for ${directorName}`,
        'invalid': `Enter a day between 1 and ${daysInBirthMonth} for ${directorName}`
      }
    }
  }

  setFormValidators (directors) {
    // Iterate the directors and build validators for each one
    for (let i = 0; i < directors.length; i++) {
      this.formValidators[`director-dob-day-${i}`] = Joi.string().required()
    }
  }

  get formValidators () {
    // Validation is carried out in the controller instead because the
    // fields to be validated are created dynamically. There doesn't appear to be
    // any way to validate dynamically created fields using Joi
    return {}
  }
}
