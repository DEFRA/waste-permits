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
      pageContext.errors[fieldName] = this.errorMessages[fieldName][error.type]

      if (!pageContext.errors[fieldName]) {
        pageContext.errors[fieldName] = `Validation message not found... Field: [${fieldName}] Error Type: [${error.type}]`
      }

      pageContext.errorList.push({
        fieldName: error.path,
        message: pageContext.errors[error.path]
      })
    })
  }
}
