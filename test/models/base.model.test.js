'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

const BaseModel = require('../../src/models/base.model')

lab.experiment('Base Model tests:', () => {
  lab.test('Base Model toString() method serialises a model object correctly', (done) => {
    const modelObject = new BaseModel()
    modelObject.additionalProperty = 'foo'

    Code.expect(modelObject.toString()).to.equal('BaseModel: {\n  additionalProperty: foo\n}')
    done()
  })
})
