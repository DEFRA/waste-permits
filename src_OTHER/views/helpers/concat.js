// concat Helper

// Concatenates together the arguments
// Usage: `{{ concat 'value1' 'value2' 'value3' aVariable }}`
module.exports = (...args) => args.slice(0, -1).join('')
