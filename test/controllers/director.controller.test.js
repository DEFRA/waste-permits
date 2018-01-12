'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

const DirectorDateOfBirthController = require('../../src/controllers/directorDateOfBirth.controller')

lab.beforeEach(() => {

})

lab.afterEach(() => {

})

lab.experiment('Directors Date of Birth Controller tests:', () => {
  lab.test('_extractDayFromDate() correctly extracts the day from a date that is in YYYY-MM-DD format', () => {
    const inputValue = '1970-05-01'
    const expected = 1
    const actual = DirectorDateOfBirthController._extractDayFromDate(inputValue)
    Code.expect(expected).to.equal(actual)
  })

  lab.test('_formatDateOfBirthForPersistence() correctly formats the date of bith into YYYY-MM-DD format ready for persistence', () => {
    const inputValue = {
      day: 1,
      month: 5,
      year: 1970
    }
    const expected = '1970-5-1'
    const actual = DirectorDateOfBirthController._formatDateOfBirthForPersistence(inputValue)
    Code.expect(expected).to.equal(actual)
  })

  lab.test('_formatDateOfBirthForDisplay() correctly formats the date of bith into MMMM YYYY format (e.g. January 1970) ready for persistence', () => {
    const unknownDate = 'Unknown date'

    // All date parts missing
    let inputValue = {
      dob: undefined
    }
    let expected = unknownDate
    let actual = DirectorDateOfBirthController._formatDateOfBirthForDisplay(inputValue)
    Code.expect(expected).to.equal(actual)

    // Day is undefined - shouuld format correctly
    inputValue = {
      dob: {
        day: undefined,
        month: 5,
        year: 1970
      }
    }
    expected = 'May 1970'
    actual = DirectorDateOfBirthController._formatDateOfBirthForDisplay(inputValue)
    Code.expect(expected).to.equal(actual)

    // Month is missing
    inputValue = {
        dob: {
        day: 1,
        month: undefined,
        year: 1970
      }
    }
    expected = unknownDate
    actual = DirectorDateOfBirthController._formatDateOfBirthForDisplay(inputValue)
    Code.expect(expected).to.equal(actual)

    // Year is missing
    inputValue = {
      dob: {
        day: 1,
        month: 5,
        year: undefined
      }
    }
    expected = unknownDate
    actual = DirectorDateOfBirthController._formatDateOfBirthForDisplay(inputValue)
    Code.expect(expected).to.equal(actual)

    // All date parts provided
    inputValue = {
      dob: {
        day: 1,
        month: 5,
        year: 1970
      }
    }
    expected = 'May 1970'
    actual = DirectorDateOfBirthController._formatDateOfBirthForDisplay(inputValue)
    Code.expect(expected).to.equal(actual)
  })
})
