'use strict'

const config = require('../../src/config/config')

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const nock = require('nock')

const Utilities = require('../../src/utilities/utilities')

lab.beforeEach(() => { })

lab.afterEach(() => { })

lab.experiment('Utilities tests:', () => {
  lab.test('stripWhitespace() should correctly return the input string without whitespace', () => {
    let inputValue, expectedResult, result

    inputValue = expectedResult = undefined
    result = Utilities.stripWhitespace(inputValue)
    Code.expect(result).to.equal(expectedResult)

    inputValue = expectedResult = ''
    result = Utilities.stripWhitespace(inputValue)
    Code.expect(result).to.equal(expectedResult)

    inputValue = '  \t  THE INPUT STRING  \n  '
    expectedResult = 'THEINPUTSTRING'
    result = Utilities.stripWhitespace(inputValue)
    Code.expect(result).to.equal(expectedResult)
  })

  lab.test('replaceNull() correctly returns the input string having replaced null with undefined', () => {
    let inputValue, expectedResult, result

    inputValue = expectedResult = undefined
    result = Utilities.replaceNull(inputValue)
    Code.expect(result).to.equal(expectedResult)

    inputValue = expectedResult = ''
    result = Utilities.replaceNull(inputValue)
    Code.expect(result).to.equal(expectedResult)

    inputValue = expectedResult = '  THE INPUT STRING  '
    result = Utilities.replaceNull(inputValue)
    Code.expect(result).to.equal(expectedResult)

    inputValue = null
    expectedResult = undefined
    result = Utilities.replaceNull(inputValue)
    Code.expect(result).to.equal(expectedResult)
  })
})
