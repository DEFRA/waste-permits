'use strict'

module.exports = class BaseValidator {
  constructor () {
    this.errorMessages = {}
  }

  customValidate (request, errors) {
    const details = errors && errors.data.details ? errors.data.details : []
    if (this.customValidators) {
      const validators = this.customValidators()
      Object.keys(validators)
      // Only validate if no error already exists for this field
        .filter((field) => !details.some(({path}) => path[0] === field))
        .forEach((field) => {
          // Only validate if no error already exists for this field
          const value = request.payload[field] || ''
          for (let type in validators[field]) {
            if (validators[field].hasOwnProperty(type) && validators[field][type](value)) {
              details.push({message: this.errorMessages[field][type], path: [field], type})
            }
          }
        })
    }

    // Now return the errors in the form expected
    if (errors && errors.data.details) {
      return errors
    } else if (details.length) {
      return {data: {details}}
    }
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
        pageContext.errors[fieldName] = []
      }

      if (!this.errorMessages[propertyWithError]) {
        // Handle validation messages missing in the validator
        pageContext.errors[fieldName].push(`Unable to find error messages for field: ${fieldName}`)
        pageContext.errorList.push({
          fieldName: fieldName,
          message: pageContext.errors[fieldName]
        })
      } else {
        // Look up the corresponding error message for the field that is in error and add to the page context
        const message = this.errorMessages[propertyWithError][error.type] || `Validation message not found... Field: [${fieldName}] Error Type: [${error.type}]`

        if (message.trim()) {
          pageContext.errorList.push({
            fieldName: fieldName,
            message: message
          })
        }

        if (message.trim()) {
          pageContext.errors[fieldName].push(message)
        }
      }
    })
  }
}
