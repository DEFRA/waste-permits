// getFormErrorGroupClass Helper

// Inspects the input validation error (if there is one) and returns the correct form group class to be used
// Usage: `{{#getFormErrorGroupClass errors.<field-name>}}`
module.exports = (options, context) => {
  return (options && options !== '') ? 'form-group-error' : ''
}
