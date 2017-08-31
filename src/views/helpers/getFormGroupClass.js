// getFormGroupClass Helper
// Usage: `{{#getFormGroupClass}}`
// Inspects the input validation error (if there is one) and returns the correct form group class to be used
module.exports = (options, context) => {
  if (options === undefined) {
    // There is no validation error
    return ''
  } else {
    // There is a validation error
    return 'form-group-error'
  }
}
