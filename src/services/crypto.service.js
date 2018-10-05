const crypto = require('crypto')
const { cookieValidationPassword } = require('../config/config')

const iv = crypto.randomBytes(16)
const hash = crypto.createHash('sha1')

hash.update(cookieValidationPassword)

// `hash.digest()` returns a Buffer by default when no encoding is given
let key = hash.digest().slice(0, 16)

const algorithm = 'aes-128-cbc'

function encrypt (text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
}

function decrypt (text) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  let dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8')
  return dec
}

module.exports = {
  encrypt,
  decrypt
}
