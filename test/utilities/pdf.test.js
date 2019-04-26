'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

const PDF = require('../../src/utilities/pdf')

lab.experiment('PDF module tests:', () => {
  lab.test('PDF module presents an object', () => {
    console.log('\n%j\n', PDF)
    Code.expect(PDF).to.be.an.object()
  })
})
