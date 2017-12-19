'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

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

  lab.test('convertFromDynamics() should correctly convert all object property values from null to undefined', () => {
    let inputValue = {}
    let expectedResult = {}
    let result

    result = Utilities.convertFromDynamics(inputValue)
    Code.expect(result).to.equal(expectedResult)

    inputValue = {
      someProp: null,
      anotherProp: 'SOME VALUE',
      nestedProp: {
        furtherNestedProp: {
          nestedProperty: null
        }
      }
    }
    expectedResult = {
      someProp: undefined,
      anotherProp: 'SOME VALUE',
      nestedProp: {
        furtherNestedProp: {
          nestedProperty: undefined
        }
      }
    }
    result = Utilities.convertFromDynamics(inputValue)
    Code.expect(result.someProp).to.equal(expectedResult.someProp)
    Code.expect(result.anotherProp).to.equal(expectedResult.anotherProp)
  })

  lab.test('convertToDynamics() should correctly convert all object property values from undefined to null', () => {
    let inputValue = {}
    let expectedResult = {}
    let result

    result = Utilities.convertToDynamics(inputValue)
    Code.expect(result).to.equal(expectedResult)

    inputValue = {
      someProp: undefined,
      anotherProp: 'SOME VALUE',
      nestedProp: {
        furtherNestedProp: {
          nestedProperty: undefined
        }
      }
    }
    expectedResult = {
      someProp: null,
      anotherProp: 'SOME VALUE',
      nestedProp: {
        furtherNestedProp: {
          nestedProperty: null
        }
      }
    }
    result = Utilities.convertToDynamics(inputValue)
    Code.expect(result.someProp).to.equal(expectedResult.someProp)
    Code.expect(result.anotherProp).to.equal(expectedResult.anotherProp)
  })

  lab.test('_replaceNull() correctly returns the input string having replaced null with undefined', () => {
    let inputValue, expectedResult, result

    inputValue = expectedResult = undefined
    result = Utilities._replaceNull(inputValue)
    Code.expect(result).to.equal(expectedResult)

    inputValue = expectedResult = ''
    result = Utilities._replaceNull(inputValue)
    Code.expect(result).to.equal(expectedResult)

    inputValue = expectedResult = '  THE INPUT STRING  '
    result = Utilities._replaceNull(inputValue)
    Code.expect(result).to.equal(expectedResult)

    inputValue = null
    expectedResult = undefined
    result = Utilities._replaceNull(inputValue)
    Code.expect(result).to.equal(expectedResult)
  })

  lab.test('_replaceUndefined() correctly returns the input string having replaced undefined with null', () => {
    let inputValue, expectedResult, result

    inputValue = expectedResult = null
    result = Utilities._replaceUndefined(inputValue)
    Code.expect(result).to.equal(expectedResult)

    inputValue = expectedResult = ''
    result = Utilities._replaceUndefined(inputValue)
    Code.expect(result).to.equal(expectedResult)

    inputValue = expectedResult = '  THE INPUT STRING  '
    result = Utilities._replaceUndefined(inputValue)
    Code.expect(result).to.equal(expectedResult)

    inputValue = undefined
    expectedResult = null
    result = Utilities._replaceUndefined(inputValue)
    Code.expect(result).to.equal(expectedResult)
  })
})
