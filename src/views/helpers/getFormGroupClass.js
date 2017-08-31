// getFormGroupClass Helper
// Usage: `{{#getFormGroupClass}}`
// Inspects the input validation error (if there is one) and returns the correct combination of
// form group classes to be used
module.exports = (options, context) => {
  if (options === undefined) {
    // There is no validation error
    return 'form-group'
  } else {
    // There is a validation error
    return 'form-group form-group-error'
  }
}
