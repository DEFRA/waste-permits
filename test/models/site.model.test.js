'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

const Site = require('../../src/models/site.model')

let testSite

lab.beforeEach((done) => {
  testSite = new Site({
    siteName: 'My Site Name',
    gridRef: '12345678'
  })
  done()
})

lab.afterEach((done) => {
  done()
})

lab.experiment('Site Model tests:', () => {
  lab.test('Constructor creates a Site object correctly', (done) => {
    Code.expect(testSite.isValid()).to.be.true()

    testSite = new Site({})
    Code.expect(testSite.siteName).to.be.undefined()
    Code.expect(testSite.gridRef).to.be.undefined()

    done()
  })

  lab.test('isValid() method validates a Site object correctly', (done) => {
    Code.expect(testSite.isValid()).to.be.true()

    testSite = new Site({
      siteName: '',
      gridRef: '12345678'
    })
    Code.expect(testSite.isValid()).to.be.false()

    testSite = new Site({
      siteName: 'My Site Name',
      gridRef: ''
    })
    Code.expect(testSite.isValid()).to.be.false()

    done()
  })
})
