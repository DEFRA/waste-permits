'use strict'

module.exports = class BaseValidator {
  constructor () {
    this.errorMessages = {}
  }

  addErrorsToPageContext (validationErrors, pageContext) {
    pageContext.errors = {}
    pageContext.errorList = []

    validationErrors.data.details.forEach((error) => {
      const errorIndex = error.path.pop() || error.path
      const fieldName = error.path.shift() || errorIndex

      if (!this.errorMessages[errorIndex]) {
        // Handle validation messages missing in the validator
        pageContext.errors[fieldName] = `Unable to find error messages for field: ${fieldName}`
        pageContext.errorList.push({
          fieldName: fieldName,
          message: pageContext.errors[fieldName]
        })
      } else {
        // Look up the corresponding error message for the field that is in error and add to the page context
        pageContext.errors[fieldName] = this.errorMessages[errorIndex][error.type]

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
