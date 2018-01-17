// getErrorMessage Helper

// Returns the error message from a collection of error messages
// Usage: `{{getErrorMessage this.errors 'field-prefix-' @index}}`
// Returns the error message with key 'field-prefix-<@index> from the errors collection)
module.exports = (...args) => {
  const errors = args[0]
  return (errors) ? errors[args[1] + args[2]] : ''
}
