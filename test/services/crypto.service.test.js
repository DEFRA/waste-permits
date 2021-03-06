'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')

const CryptoService = require('../../src/services/crypto.service')

lab.experiment('CryptoService test:', () => {
  lab.test('Encrypt and Decrypt correctly', async () => {
    const original = 'abcdefghijklmnopqrstuvwxyz'
    const encrypted = CryptoService.encrypt(original)
    const decrypted = CryptoService.decrypt(encrypted)
    Code.expect(decrypted).to.equal(original)
  })
})
