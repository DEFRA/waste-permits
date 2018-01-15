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

  lab.test('extractDayFromDate() correctly extracts the day from a date that is in YYYY-MM-DD format', () => {
    const inputValue = '1970-05-01'
    const expected = 1
    const actual = Utilities.extractDayFromDate(inputValue)
    Code.expect(expected).to.equal(actual)
  })

  lab.test('formatDateForPersistence() correctly formats the date of bith into YYYY-MM-DD format ready for persistence', () => {
    const inputValue = {
      day: 1,
      month: 5,
      year: 1970
    }
    const expected = '1970-5-1'
    const actual = Utilities.formatDateForPersistence(inputValue)
    Code.expect(expected).to.equal(actual)
  })

  lab.test('formatDateForDisplay() correctly formats the date of bith into MMMM YYYY format (e.g. January 1970) ready for persistence', () => {
    const unknownDate = 'Unknown date'

    // All date parts missing
    let inputValue = {
      dob: undefined
    }
    let expected = unknownDate
    let actual = Utilities.formatDateForDisplay(inputValue)
    Code.expect(expected).to.equal(actual)

    // Day is undefined - shouuld format correctly
    inputValue = {
      day: undefined,
      month: 5,
      year: 1970
    }
    expected = 'May 1970'
    actual = Utilities.formatDateForDisplay(inputValue)
    Code.expect(expected).to.equal(actual)

    // Month is missing
    inputValue = {
      day: 1,
      month: undefined,
      year: 1970
    }
    expected = unknownDate
    actual = Utilities.formatDateForDisplay(inputValue)
    Code.expect(expected).to.equal(actual)

    // Year is missing
    inputValue = {
      day: 1,
      month: 5,
      year: undefined
    }
    expected = unknownDate
    actual = Utilities.formatDateForDisplay(inputValue)
    Code.expect(expected).to.equal(actual)

    // All date parts provided
    inputValue = {
      day: 1,
      month: 5,
      year: 1970
    }
    expected = 'May 1970'
    actual = Utilities.formatDateForDisplay(inputValue)
    Code.expect(expected).to.equal(actual)
  })
})
