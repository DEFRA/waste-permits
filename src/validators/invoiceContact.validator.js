'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')
const Constants = require('../constants')
const AddressDetail = require('../persistence/entities/addressDetail.entity')
const Contact = require('../persistence/entities/contact.entity')

const {
  EMAIL_VALID_REGEX,
  LEADING_AND_TRAILING_DASHES_REGEX,
  LETTERS_HYPHENS_SPACES_AND_APOSTROPHES_REGEX,
  PLUSES_AND_SPACES_REGEX,
  PLUSES_CANNOT_PRECEDE_ZERO,
  PLUSES_SPACES_AND_NUMBERS_REGEX
} = Constants.Validation

module.exports = class InvoiceContactValidator extends BaseValidator {
  get errorMessages () {
    return {
      'first-name': {
        'any.empty': `Enter a first name`,
        'any.required': `Enter a first name`,
        'string.min': `First name must have at least two letters - if you entered an initial please enter a name`,
        'custom.invalid': `First name can only include letters, hyphens, apostrophes and up to 2 spaces - delete any other characters`,
        'custom.no-leading-and-trailing-dashes': `First name cannot start or end with a dash - delete the dash`,
        'string.max': `Enter a shorter first name with no more than ${Contact.firstName.length.max} characters`
      },
      'last-name': {
        'any.empty': `Enter a last name`,
        'any.required': `Enter a last name`,
        'string.min': `Last name must have at least two letters - if you entered an initial please enter a name`,
        'custom.invalid': `Last name can only include letters, hyphens, apostrophes and up to 2 spaces - delete any other characters`,
        'custom.no-leading-and-trailing-dashes': `Last name cannot start or end with a dash - delete the dash`,
        'string.max': `Enter a shorter last name with no more than ${Contact.lastName.length.max} characters`
      },
      'email': {
        'any.empty': `Enter a valid email address`,
        'any.required': `Enter a valid email address`,
        'string.regex.base': `Enter a valid email address`,
        'string.max': `Enter a shorter email address with no more than ${Contact.email.length.max} characters`
      },
      'telephone': {
        'any.empty': `Enter a valid telephone number`,
        'any.required': `Enter a valid telephone number`,
        'custom.invalid': `Telephone number can only include numbers, spaces and the + sign. Please remove any other characters.`,
        'custom.plus-zero': `The + sign for international numbers should be at the start of the number, followed by a number 1 to 9, not a 0`,
        'custom.min': `That telephone number is too short. It should have at least ${AddressDetail.telephone.length.min} characters. Make sure you include the area code.`,
        'custom.max': `That telephone number is too long. It should have no more than ${AddressDetail.telephone.length.maxDigits} digits.`,
        'string.max': `That telephone number is too long. It should have no more than ${AddressDetail.telephone.length.max} characters.`
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
        .required(),
      'email': Joi
        .string()
        .max(Contact.email.length.max)
        .regex(EMAIL_VALID_REGEX)
        .required(),
      'telephone': Joi
        .string()
        .max(AddressDetail.telephone.length.max)
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
      'telephone': {
        'custom.invalid': (value) => !(PLUSES_SPACES_AND_NUMBERS_REGEX).test(value),
        'custom.plus-zero': (value) => !(PLUSES_CANNOT_PRECEDE_ZERO).test(value),
        'custom.min': (value) => value.replace(PLUSES_AND_SPACES_REGEX, '').length < AddressDetail.telephone.length.min,
        'custom.max': (value) => value.replace(PLUSES_AND_SPACES_REGEX, '').length > AddressDetail.telephone.length.maxDigits
      }
    }
  }
}
