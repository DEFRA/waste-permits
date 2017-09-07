'use strict'

module.exports = class BaseValidator {
  constructor () {
    this.errorMessages = {}
  }

  addErrorsToPageContext (validationErrors, pageContext) {
    pageContext.errors = {}
    pageContext.errorList = []

    validationErrors.data.details.forEach((error) => {
      const fieldName = error.path

      if (!this.errorMessages[fieldName]) {
        // Handle validation messages missing in the validator
        pageContext.errors[fieldName] = `Unable to find error messages for field: ${fieldName}`
        pageContext.errorList.push({
          fieldName: fieldName,
          message: pageContext.errors[fieldName]
        })
      } else {
        // Look up the corresponding error message for the field that is in error and add to the page context
        pageContext.errors[fieldName] = this.errorMessages[fieldName][error.type]

        if (!pageContext.errors[fieldName]) {
          pageContext.errors[fieldName] = `Validation message not found... Field: [${fieldName}] Error Type: [${error.type}]`
        }

        pageContext.errorList.push({
          fieldName: fieldName,
          message: pageContext.errors[fieldName]
        })
      }
    })
  }
}
