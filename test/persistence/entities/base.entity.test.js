'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const BaseEntity = require('../../../src/persistence/entities/base.entity')
const DynamicsDalService = require('../../../src/services/dynamicsDal.service')
const context = { authToken: 'AUTH_TOKEN' }

// Create fake Entity class for tests
// ---------------------------------
class Entity extends BaseEntity {
  static get dynamicsEntity () {
    return 'accounts'
  }

  static get mapping () {
    return [
      { field: 'id', dynamics: 'dynamicsId' },
      { field: 'otherId', dynamics: '_dynamicsOtherId_value', bind: { id: 'dynamicsOtherId', relationship: 'dynamicsOtherEntityDynamicsOtherId', dynamicsEntity: 'dynamicsOtherEntity' } },
      { field: 'entityName', dynamics: 'dynamicsName', length: { max: 15, min: 10 } },
      { field: 'dob.month', dynamics: 'dynamicsDobMonth' },
      { field: 'dob.year', dynamics: 'dynamicsDobYear' },
      { field: 'ref', dynamics: 'dynamicsRef', readOnly: true },
      { field: 'secret', dynamics: 'dynamicsSecret', writeOnly: true },
      { field: 'constantValue', dynamics: 'dynamicsConstantValue', constant: 'CONSTANT VALUE' },
      { field: 'optionalData', dynamics: 'dynamicsOptionalData' }
    ]
  }
}

Entity.setDefinitions()
// ---------------------------------

let sandbox
let entityData
let dynamicsRequestData
let dynamicsReplyData

lab.experiment('Base Entity tests:', () => {
  lab.beforeEach(() => {
    entityData = {
      id: 'ID',
      otherId: 'OTHERID',
      entityName: 'ENTITY_NAME',
      dob: {
        month: 'MONTH',
        year: 'YEAR'
      },
      ref: 'REF',
      constantValue: 'CONSTANT VALUE',
      secret: 'SECRET',
      optionalData: undefined
    }

    dynamicsRequestData = {
      dynamicsId: 'ID',
      'dynamicsOtherId@odata.bind': 'dynamicsOtherEntity(OTHERID)',
      dynamicsName: 'ENTITY_NAME',
      dynamicsDobMonth: 'MONTH',
      dynamicsDobYear: 'YEAR',
      dynamicsConstantValue: 'CONSTANT VALUE',
      dynamicsSecret: 'SECRET',
      dynamicsOptionalData: undefined
    }

    dynamicsReplyData = {
      dynamicsId: 'ID',
      '_dynamicsOtherId_value': 'OTHERID',
      dynamicsName: 'ENTITY_NAME',
      dynamicsDobMonth: 'MONTH',
      dynamicsDobYear: 'YEAR',
      dynamicsRef: 'REF'
    }

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()

    // Stub methods
    sandbox.stub(DynamicsDalService.prototype, 'search').value(() => dynamicsReplyData)
    sandbox.stub(DynamicsDalService.prototype, 'update').value(() => dynamicsReplyData)
  })

  lab.afterEach(() => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.test('toString() method serialises the base entity object correctly', () => {
    const entityObject = new BaseEntity()
    entityObject.additionalProperty = 'foo'

    Code.expect(entityObject.toString()).to.equal('BaseEntity: {\n  "additionalProperty": "foo"\n}')
  })

  lab.test('toString() method serialises  test entity object correctly', () => {
    const entity = new Entity(entityData)
    Code.expect(entity.toString()).to.equal('Entity: {\n  "id": "ID", "otherId": "OTHERID", "entityName": "ENTITY_NAME", "dob": {\n  "month": "MONTH", "year": "YEAR"\n}, "ref": "REF", "constantValue": "CONSTANT VALUE", "secret": "SECRET"\n}')
  })

  lab.test('isNew() correctly identifies if the instance has a Dynamics ID', () => {
    const entityObject = new BaseEntity()
    entityObject.additionalProperty = 'id'

    Code.expect(entityObject.isNew()).to.be.true()

    entityObject.id = '7a8e4354-4f24-e711-80fd-5065f38a1b01'
    Code.expect(entityObject.isNew()).to.be.false()
  })

  lab.test('entityToDynamics() method successfully converts the entity to dynamics data', () => {
    const entity = new Entity(entityData)
    Code.expect(entity.entityToDynamics()).to.equal(dynamicsRequestData)
  })

  lab.experiment('entityToDynamics() method fails to convert the entity to dynamics data', () => {
    lab.test('when a field value is too long', () => {
      const entity = new Entity(entityData)
      entity.entityName = 'NAME_IS_FAR_TO_LONG'
      let message
      try {
        entity.entityToDynamics()
      } catch (error) {
        message = error.message
      }
      Code.expect(message).to.equal(`Entity.entityName exceeds maximum length of ${Entity.entityName.length.max} characters`)
    })

    lab.test('when a field value is too short', () => {
      const entity = new Entity(entityData)
      entity.entityName = 'TOO_SHORT'
      let message
      try {
        entity.entityToDynamics()
      } catch (error) {
        message = error.message
      }
      Code.expect(message).to.equal(`Entity.entityName does not meet minimum length of ${Entity.entityName.length.min} characters`)
    })
  })

  lab.test('dynamicsToEntity() method converts the dynamics data to the entity', () => {
    const testEntity = new Entity(entityData)
    testEntity.secret = undefined
    Code.expect(Entity.dynamicsToEntity(dynamicsReplyData)).to.equal(testEntity)
  })

  lab.test('listUsingFetchXml() method retrieves a list of entities from the result of the fetchXml query', async () => {
    entityData.secret = undefined
    const dynamicsData = { value: [dynamicsReplyData, dynamicsReplyData] }
    sinon.stub(DynamicsDalService.prototype, 'search').value(() => dynamicsData)
    let list = await Entity.listUsingFetchXml(context)
    Code.expect(list.length).to.equal(dynamicsData.value.length)
    Code.expect(list[0]).to.equal(entityData)
  })

  lab.test('getById() method returns a entity without constant or writeonly fields', async () => {
    const testEntity = new Entity(entityData)
    testEntity.secret = undefined
    Code.expect(await Entity.getById(context, entityData.id)).to.equal(testEntity)
  })

  lab.test('_deleteBoundReferences() method to delete a bound reference to another entity ', async () => {
    const entity = new Entity(entityData)
    // now clear the reference
    entity.otherId = undefined
    let searchQuery = ''
    let deleteQuery = ''
    const dynamicsDal = {
      delete: (query) => {
        deleteQuery = query
      },
      search: (query) => {
        searchQuery = query
        return dynamicsReplyData
      }
    }
    await entity._deleteBoundReferences(dynamicsDal)
    Code.expect(searchQuery).to.equal('accounts(ID)?$select=_dynamicsOtherId_value')
    Code.expect(deleteQuery).to.equal('dynamicsOtherEntity(OTHERID)/dynamicsOtherEntityDynamicsOtherId(ID)/$ref')
  })

  lab.test('_buildQueryCriterion() method to build and encode the query criterion data correctly when it includes an apostrophe', async () => {
    Code.expect(BaseEntity._buildQueryCriterion('field', true, "O'Shea")).to.equal("field eq 'O''Shea'")
  })

  lab.experiment('readOnly property on entity set to true should', () => {
    const dynamicsEntity = 'read_only_entity'

    class ReadOnlyEntity extends BaseEntity {
      static get dynamicsEntity () {
        return dynamicsEntity
      }

      static get readOnly () {
        return true
      }
    }

    const entity = new ReadOnlyEntity(entityData)

    lab.test('prevent saving', async () => {
      let message
      try {
        await entity.save()
      } catch (error) {
        message = error.message
      }
      Code.expect(message).to.equal(`Unable to save ${dynamicsEntity}: Read only!`)
    })

    lab.test('prevent deletion', async () => {
      let message
      try {
        await entity.delete()
      } catch (error) {
        message = error.message
      }
      Code.expect(message).to.equal(`Unable to delete ${dynamicsEntity}: Read only!`)
    })
  })

  lab.test('save() method updates a Entity object', async () => {
    let dataObject = {}
    sinon.stub(DynamicsDalService.prototype, 'update').value((key, data) => {
      dataObject = data
    })
    const testEntity = new Entity(entityData)

    await testEntity.save(context)

    Code.expect(dataObject).to.equal(dynamicsRequestData)
  })

  lab.test('save() method updates a Entity object with only the specified fields', async () => {
    let dataObject = {}
    sinon.stub(DynamicsDalService.prototype, 'update').value((key, data) => {
      dataObject = data
    })
    entityData.optionalData = 'OPTIONAL_DATA'
    const testEntity = new Entity(entityData)

    await testEntity.save(context, ['entityName', 'optionalData'])

    Code.expect(dataObject).to.equal({
      dynamicsName: entityData.entityName,
      dynamicsOptionalData: entityData.optionalData
    })
  })
})
