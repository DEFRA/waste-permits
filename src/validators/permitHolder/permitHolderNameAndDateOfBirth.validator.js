'use strict'

const moment = require('moment')
const Joi = require('joi')
const BaseValidator = require('../base.validator')
const Constants = require('../../constants')
const AddressDetail = require('../../persistence/entities/addressDetail.entity')
const Contact = require('../../persistence/entities/contact.entity')

const {
  LEADING_AND_TRAILING_DASHES_REGEX,
  LETTERS_HYPHENS_SPACES_AND_APOSTROPHES_REGEX
} = Constants.Validation

const MAX_AGE = 120
const MIN_AGE = 16

function checkOnlyDigits (number) {
  const regex = /^\d*$/
  return !!regex.exec(number)
}

function getAge (day, month, year) {
  if (!checkOnlyDigits(day) || !checkOnlyDigits(month) || !checkOnlyDigits(year)) {
    return false
  }

  const date = moment({
    day,
    month: parseInt(month) - 1, // Because moment 0 indexes months
    year
  })

  return day && month && year && date.isValid() ? -date.diff(Date.now(), 'years', true) : 0
}

module.exports = class PermitHolderNameAndDateOfBirthValidator extends BaseValidator {
  get errorMessages () {
    return {
      'first-name': {
        'any.empty': 'Enter a first name',
        'any.required': 'Enter a first name',
        'string.min': 'First name must have at least two letters - if you entered an initial please enter a name',
        'custom.invalid': 'First name can only include letters, hyphens, apostrophes and up to 2 spaces - delete any other characters',
        'custom.no-leading-and-trailing-dashes': 'First name cannot start or end with a dash - delete the dash',
        'string.max': `Enter a shorter first name with no more than ${Contact.firstName.length.max} characters`
      },
      'last-name': {
        'any.empty': 'Enter a last name',
        'any.required': 'Enter a last name',
        'string.min': 'Last name must have at least two letters - if you entered an initial please enter a name',
        'custom.invalid': 'Last name can only include letters, hyphens, apostrophes and up to 2 spaces - delete any other characters',
        'custom.no-leading-and-trailing-dashes': 'Last name cannot start or end with a dash - delete the dash',
        'string.max': `Enter a shorter last name with no more than ${Contact.lastName.length.max} characters`
      },
      'job-title': {
        'custom.required': 'Enter a position or job title',
        'custom.max': `Enter a shorter position or job title with no more than ${AddressDetail.jobTitle.length.max} characters`
      },
      'dob-day': {
        'custom.invalid': 'Enter a valid date of birth',
        'custom.range': `Enter a date of birth that is older than ${MIN_AGE} and under ${MAX_AGE} years of age`
      }
    }
  }

  get formValidators () {
    return {
      'first-name': Joi
        .string()
        .min(2)
        .max(Contact.firstName.length.max)
        .required(),
      'last-name': Joi
        .string()
        .min(2)
        .max(Contact.lastName.length.max)
        .required()
    }
  }

  get customValidators () {
    return {
      'first-name': {
        'custom.invalid': (value) => !(LETTERS_HYPHENS_SPACES_AND_APOSTROPHES_REGEX).test(value),
        'custom.no-leading-and-trailing-dashes': (value) => (LEADING_AND_TRAILING_DASHES_REGEX).test(value)
      },
      'last-name': {
        'custom.invalid': (value) => !(LETTERS_HYPHENS_SPACES_AND_APOSTROPHES_REGEX).test(value),
        'custom.no-leading-and-trailing-dashes': (value) => (LEADING_AND_TRAILING_DASHES_REGEX).test(value)
      },
      'job-title': {
        'custom.required': (value, { 'includes-job-title': includesJobTitle }) => includesJobTitle && value.length === 0,
        'custom.max': (value, { 'includes-job-title': includesJobTitle }) => includesJobTitle && value.length > AddressDetail.jobTitle.length.max
      },
      'dob-day': {
        'custom.invalid': (dobDay, { 'dob-month': dobMonth, 'dob-year': dobYear }) => !getAge(dobDay, dobMonth, dobYear),
        'custom.range': (dobDay, { 'dob-month': dobMonth, 'dob-year': dobYear }) => {
          const age = getAge(dobDay, dobMonth, dobYear)
          return !(age > MIN_AGE && age < MAX_AGE)
        }
      }
    }
  }
}
