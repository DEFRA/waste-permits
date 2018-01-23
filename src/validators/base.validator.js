'use strict'

module.exports = class BaseValidator {
  constructor () {
    this.errorMessages = {}
  }

  customValidate (request, errors) {
    const customErrors = []
    if (this.customValidators) {
      // Only validate fields where there is currently not an error of type 'any.required' already present
      let requiredFields = []
      if (errors) {
        requiredFields = errors
          .filter(({type}) => type === 'any.required')
          .map(({path}) => path.split('.').pop())
      }
      const validators = this.customValidators()
      Object.keys(validators)
        .forEach((field) => {
          if (requiredFields.indexOf(field) === -1) {
            const value = request.payload[field] || ''
            for (let type in validators[field]) {
              if (validators[field].hasOwnProperty(type)) {
                const validatorFunction = validators[field][type]
                if (validatorFunction(value)) {
                  customErrors.push({message: this.errorMessages[field][type], path: [field], type})
                }
              }
            }
          }
        })
    }
    return customErrors
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
