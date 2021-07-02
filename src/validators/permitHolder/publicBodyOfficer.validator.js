const Joi = require('joi')
const BaseValidator = require('../base.validator')
const Constants = require('../../constants')
const Contact = require('../../persistence/entities/contact.entity')
const AddressDetail = require('../../persistence/entities/addressDetail.entity')

const {
  EMAIL_VALID_REGEX,
  LEADING_AND_TRAILING_DASHES_REGEX,
  LETTERS_HYPHENS_SPACES_AND_APOSTROPHES_REGEX
} = Constants.Validation

module.exports = class PublicBodyOfficerValidator extends BaseValidator {
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
      email: {
        'any.empty': 'Enter an email address for the main contact',
        'any.required': 'Enter an email address for the main contact',
        'string.regex.base': 'Enter a valid email address for the main contact',
        'string.max': `Enter a shorter email address for the main contact with no more than ${AddressDetail.email.length.max} characters`
      },
      'job-title': {
        'any.empty': 'Enter a position or job title',
        'any.required': 'Enter a position or job title',
        'string.max': `Enter a shorter position or job title with no more than ${AddressDetail.jobTitle.length.max} characters`
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
      email: Joi
        .string()
        .max(AddressDetail.email.length.max)
        .regex(EMAIL_VALID_REGEX)
        .required(),
      'job-title': Joi
        .string()
        .max(AddressDetail.jobTitle.length.max)
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
      }
    }
  }
}
