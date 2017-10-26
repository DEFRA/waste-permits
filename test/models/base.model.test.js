'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

const BaseModel = require('../../src/models/base.model')

lab.beforeEach(() => {

})

lab.afterEach(() => {

})

lab.experiment('Base Model tests:', () => {
  lab.test('toString() method serialises a model object correctly', () => {
    const modelObject = new BaseModel()
    modelObject.additionalProperty = 'foo'

    Code.expect(modelObject.toString()).to.equal('BaseModel: {\n  additionalProperty: foo\n}')
  })

  lab.test('isNew() correctly identifies if the instance has a Dynamics ID', () => {
    const modelObject = new BaseModel()
    modelObject.additionalProperty = 'id'

    Code.expect(modelObject.isNew()).to.be.true()

    modelObject.id = '7a8e4354-4f24-e711-80fd-5065f38a1b01'
    Code.expect(modelObject.isNew()).to.be.false()
  })
})
