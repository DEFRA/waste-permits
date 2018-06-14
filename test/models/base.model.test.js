'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

const BaseModel = require('../../src/models/base.model')

class Model extends BaseModel {
  static get entity () {
    return 'accounts'
  }

  static get mapping () {
    return [
      {field: 'id', dynamics: 'dynamicsId'},
      {field: 'otherId', dynamics: '_dynamicsOtherId_value', bind: {id: 'dynamicsOtherId', relationship: 'dynamicsOtherModelDynamicsOtherId', entity: 'dynamicsOtherModel'}},
      {field: 'modelName', dynamics: 'dynamicsName', length: {max: 15, min: 10}},
      {field: 'dob.month', dynamics: 'dynamicsDobMonth'},
      {field: 'dob.year', dynamics: 'dynamicsDobYear'},
      {field: 'ref', dynamics: 'dynamicsRef', readOnly: true},
      {field: 'regime', dynamics: 'dynamicsRegime', constant: 'REGIME'},
      {field: 'optionalData', dynamics: 'dynamicsOptionalData'}
    ]
  }
}

Model.setDefinitions()

const modelData = {
  id: 'ID',
  otherId: 'OTHERID',
  modelName: 'MODEL_NAME',
  dob: {
    month: 'MONTH',
    year: 'YEAR'
  },
  ref: 'REF',
  regime: 'REGIME',
  optionalData: undefined
}

const dynamicsRequestData = {
  dynamicsId: 'ID',
  'dynamicsOtherId@odata.bind': 'dynamicsOtherModel(OTHERID)',
  dynamicsName: 'MODEL_NAME',
  dynamicsDobMonth: 'MONTH',
  dynamicsDobYear: 'YEAR',
  dynamicsRegime: 'REGIME',
  dynamicsOptionalData: undefined
}

const dynamicsReplyData = {
  dynamicsId: 'ID',
  '_dynamicsOtherId_value': 'OTHERID',
  dynamicsName: 'MODEL_NAME',
  dynamicsDobMonth: 'MONTH',
  dynamicsDobYear: 'YEAR',
  dynamicsRef: 'REF'
}

lab.experiment('Base Model tests:', () => {
  lab.test('toString() method serialises the base model object correctly', () => {
    const modelObject = new BaseModel()
    modelObject.additionalProperty = 'foo'

    Code.expect(modelObject.toString()).to.equal('BaseModel: {\n  "additionalProperty": "foo"\n}')
  })

  lab.test('toString() method serialises  test model object correctly', () => {
    const model = new Model(modelData)
    Code.expect(model.toString()).to.equal('Model: {\n  "id": "ID", "otherId": "OTHERID", "modelName": "MODEL_NAME", "dob": {\n  "month": "MONTH", "year": "YEAR"\n}, "ref": "REF", "regime": "REGIME"\n}')
  })

  lab.test('isNew() correctly identifies if the instance has a Dynamics ID', () => {
    const modelObject = new BaseModel()
    modelObject.additionalProperty = 'id'

    Code.expect(modelObject.isNew()).to.be.true()

    modelObject.id = '7a8e4354-4f24-e711-80fd-5065f38a1b01'
    Code.expect(modelObject.isNew()).to.be.false()
  })

  lab.test('modelToDynamics() method successfully converts the model to dynamics data', () => {
    const model = new Model(modelData)
    Code.expect(model.modelToDynamics()).to.equal(dynamicsRequestData)
  })

  lab.experiment('modelToDynamics() method fails to convert the model to dynamics data', () => {
    lab.test('when a field value is too long', () => {
      const model = new Model(modelData)
      model.modelName = 'NAME_IS_FAR_TO_LONG'
      let message
      try {
        model.modelToDynamics()
      } catch (error) {
        message = error.message
      }
      Code.expect(message).to.equal(`Model.modelName exceeds maximum length of ${Model.modelName.length.max} characters`)
    })

    lab.test('when a field value is too short', () => {
      const model = new Model(modelData)
      model.modelName = 'TOO_SHORT'
      let message
      try {
        model.modelToDynamics()
      } catch (error) {
        message = error.message
      }
      Code.expect(message).to.equal(`Model.modelName does not meet minimum length of ${Model.modelName.length.min} characters`)
    })
  })

  lab.test('dynamicsToModel() method converts the dynamics data to the model', () => {
    Code.expect(Model.dynamicsToModel(dynamicsReplyData)).to.equal(modelData)
  })

  lab.test('_deleteBoundReferences() method to delete a bound reference to another entity ', async () => {
    const model = new Model(modelData)
    // now clear the reference
    model.otherId = undefined
    let searchQuery
    let deleteQuery
    const dynamicsDal = {
      delete: (query) => {
        deleteQuery = query
      },
      search: (query) => {
        searchQuery = query
        return dynamicsReplyData
      }
    }
    await model._deleteBoundReferences(dynamicsDal)
    Code.expect(searchQuery).to.equal('accounts(ID)?$select=_dynamicsOtherId_value')
    Code.expect(deleteQuery).to.equal('dynamicsOtherModel(OTHERID)/dynamicsOtherModelDynamicsOtherId(ID)/$ref')
  })

  lab.experiment('readOnly property on model set to true should', () => {
    const entity = 'read_only_entity'
    class ReadOnlyModel extends BaseModel {
      static get entity () {
        return entity
      }
      static get readOnly () {
        return true
      }
    }
    const model = new ReadOnlyModel(modelData)

    lab.test('prevent saving', async () => {
      let message
      try {
        await model.save()
      } catch (error) {
        message = error.message
      }
      Code.expect(message).to.equal(`Unable to save ${entity}: Read only!`)
    })

    lab.test('prevent deletion', async () => {
      let message
      try {
        await model.delete()
      } catch (error) {
        message = error.message
      }
      Code.expect(message).to.equal(`Unable to delete ${entity}: Read only!`)
    })
  })
})
