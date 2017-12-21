'use strict'

module.exports = class BaseValidator {
  constructor () {
    this.errorMessages = {}
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

      if (!this.errorMessages[propertyWithError]) {
        // Handle validation messages missing in the validator
        pageContext.errors[fieldName] = `Unable to find error messages for field: ${fieldName}`
        pageContext.errorList.push({
          fieldName: fieldName,
          message: pageContext.errors[fieldName]
        })
      } else {
        // Look up the corresponding error message for the field that is in error and add to the page context
        pageContext.errors[fieldName] = this.errorMessages[propertyWithError][error.type]

        if (!pageContext.errors[fieldName]) {
          pageContext.errors[fieldName] = `Validation message not found... Field: [${fieldName}] Error Type: [${error.type}]`
        }

        if (pageContext.errors[fieldName].trim()) {
          pageContext.errorList.push({
            fieldName: fieldName,
            message: pageContext.errors[fieldName]
          })
        }
      }
    })
  }
}
