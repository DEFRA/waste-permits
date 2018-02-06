// getErrorFieldClass Helper

// Returns the error message from a collection of error messages
// Usage: `{{getErrorFieldClass this.errors}}`
// Returns the error class if the error is set)
module.exports = (...args) => {
  const errors = args[0]
  return (errors) ? 'form-control-error' : ''
}
