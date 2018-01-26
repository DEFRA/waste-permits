'use strict'

const ObjectPath = require('object-path')

function _getRequired (errors) {
  const requiredFields = {}
  errors
    .filter(({type}) => type === 'any.required')
    .forEach(({type, path}) => {
      if (type === 'any.required') {
        requiredFields[path[0]] = true
      }
    })
  return requiredFields
}

function _customValidate (data, errors, validators, errorMessages) {
  const customErrors = []
  // Only validate fields where there is currently not an error of type 'any.required' already present
  const requiredFields = _getRequired(errors)
  Object.keys(validators)
    .forEach((field) => {
      if (!requiredFields[field]) {
        Object.keys(validators[field])
          .forEach((type) => {
            const validatorFunction = validators[field][type]
            if (validatorFunction(data[field] || '')) {
              customErrors.push({message: errorMessages[field][type], path: [field], type})
            }
          })
      }
    })
  return customErrors
}

module.exports = class BaseValidator {
  constructor () {
    this.errorMessages = {}
  }

  customValidate (data, errors) {
    // Get current errors
    const currentErrors = ObjectPath.get(errors, 'data.details') || []
    // Get custom errors
    let customErrors = _customValidate(data, currentErrors, this.customValidators(), this.errorMessages)
    if (customErrors.length) {
      // Now merge the errors based on the order of the fields within the errorMessages definition
      const details = []
      for (let fieldName in this.errorMessages) {
        currentErrors
          .filter(({path}) => path[0] === fieldName)
          .forEach((error) => details.push(error))
        customErrors
          .filter(({path}) => path[0] === fieldName)
          .forEach((error) => details.push(error))
      }
      // Set errors to the structure expected by Hapi
      errors = {data: {details}}
    }
    return errors
  }

  addErrorsToPageContext (validationErrors, pageContext) {
    pageContext.errors = {}
    pageContext.errorList = []

    validationErrors.data.details.forEach((error) => {
      // The error path leads from the field to the descendant property of that field that has the error.
      // Usually there is only one item in the path as field values are not typically objects however in the case of an input of type file
      // the value is an object so content-type for example is a descendant property of that object and the error will be found in the path to content-type.
      const fieldName = error.path[0] // field that the error is to be associated with.
      const propertyWithError = error.path.pop() // the descendant in the path where the error can be found.
      if (!pageContext.errors[fieldName]) {
        // Create an array to hold all the errors that will refer to this fieldName
        pageContext.errors[fieldName] = []
      }

      let message = `Unable to find error messages for field: ${fieldName}`
      if (this.errorMessages[propertyWithError]) {
        // Look up the corresponding error message for the field that is in error and add to the page context
        message = this.errorMessages[propertyWithError][error.type] || `Validation message not found... Field: ${fieldName}, Error Type: ${error.type}`
      }

      if (message.trim()) {
        // Only add the error if it's not blank
        pageContext.errorList.push({
          fieldName: fieldName,
          message: message
        })
        pageContext.errors[fieldName].push(message)
      }
    })
  }
}
