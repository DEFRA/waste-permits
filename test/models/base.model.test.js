'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

const BaseModel = require('../../src/models/base.model')

class Model extends BaseModel {
  static mapping () {
    return [
      {field: 'id', dynamics: 'dynamicsIdValue', bind: {id: 'dynamicsId', relationship: 'dynamicsOtherModelDynamicsId', entity: 'dynamicsOtherModel'}},
      {field: 'name', dynamics: 'dynamicsName'},
      {field: 'dob.month', dynamics: 'dynamicsDobMonth'},
      {field: 'dob.year', dynamics: 'dynamicsDobYear'},
      {field: 'ref', dynamics: 'dynamicsRef', readOnly: true},
      {field: 'regime', dynamics: 'dynamicsRegime', defaultVal: 'REGIME'}
    ]
  }
}

const modelData = {
  id: 'ID',
  name: 'NAME',
  dob: {
    month: 'MONTH',
    year: 'YEAR'
  },
  ref: 'REF'
}

const dynamicsRequestData = {
  'dynamicsId@odata.bind': 'dynamicsOtherModel(ID)',
  dynamicsName: 'NAME',
  dynamicsDobMonth: 'MONTH',
  dynamicsDobYear: 'YEAR',
  dynamicsRegime: 'REGIME'
}

const dynamicsReplyData = {
  dynamicsIdValue: 'ID',
  dynamicsName: 'NAME',
  dynamicsDobMonth: 'MONTH',
  dynamicsDobYear: 'YEAR',
  dynamicsRef: 'REF'
}

lab.beforeEach(() => {

})

lab.afterEach(() => {

})

lab.experiment('Base Model tests:', () => {
  lab.test('toString() method serialises the base model object correctly', () => {
    const modelObject = new BaseModel()
    modelObject.additionalProperty = 'foo'

    Code.expect(modelObject.toString()).to.equal('BaseModel: {\n  "additionalProperty": "foo"\n}')
  })

  lab.test('toString() method serialises  test model object correctly', () => {
    const model = new Model(modelData)
    Code.expect(model.toString()).to.equal('Model: {\n  "id": "ID", "name": "NAME", "dob": {\n  "month": "MONTH", "year": "YEAR"\n}, "ref": "REF"\n}')
  })

  lab.test('isNew() correctly identifies if the instance has a Dynamics ID', () => {
    const modelObject = new BaseModel()
    modelObject.additionalProperty = 'id'

    Code.expect(modelObject.isNew()).to.be.true()

    modelObject.id = '7a8e4354-4f24-e711-80fd-5065f38a1b01'
    Code.expect(modelObject.isNew()).to.be.false()
  })

  lab.test('modelToDynamics() method converts the model to dynamics data', () => {
    const model = new Model(modelData)
    Code.expect(model.modelToDynamics()).to.equal(dynamicsRequestData)
  })

  lab.test('dynamicsToModel() method converts the dynamics data to the model', () => {
    Code.expect(Model.dynamicsToModel(dynamicsReplyData)).to.equal(modelData)
  })
})
