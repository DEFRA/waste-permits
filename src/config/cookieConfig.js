/* eslint-disable no-multi-spaces */
const config = require('./config')

const cookieOptions = {
  ttl: undefined, // Session lifespan (deleted when browser closed)
  isSecure: true, // Secure
  isHttpOnly: true, // and non-secure
  isSameSite: 'Strict', // Don't attach cookies on cross-site requests, preventing CSRF attacks
  encoding: 'base64json', // Base 64 JSON encoded
  sign: { // Sign values assigned to the cookie to ensure they came from the server
    password: config.cookieValidationPassword
  },
  clearInvalid: false, // Remove invalid cookies
  strictHeader: true, // Don't allow violations of RFC 6265,
  ignoreErrors: true // Errors are ignored and treated as missing cookies
}

module.exports = { options: cookieOptions }
