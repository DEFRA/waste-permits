const crypto = require('crypto')
const { cookieValidationPassword } = require('../config/config')

const hash = crypto.createHash('sha256')

// Todo: Fix this to create a random iv correctly.
hash.update(cookieValidationPassword)

const digest = hash.digest()
let key = digest.slice(0, 16)
let iv = digest.slice(16, 32)

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
