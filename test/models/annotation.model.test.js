'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Annotation = require('../../src/models/annotation.model')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

let dynamicsSearchStub
let dynamicsCreateStub
let dynamicsUpdateStub
let dynamicsDeleteStub
let testAnnotation
const testAnnotationId = 'ANNOTATION_ID'

const fakeApplication = {
  id: 'APPLICATION_ID'
}

const fakeAnnotation = {
  entity: 'annotations',
  applicationId: fakeApplication.id,
  documentBody: undefined,
  subject: 'ANNOTATION_NAME',
  filename: 'ANNOTATION_FILENAME'
}

const fakeDynamicsRecord = (options = {}) => {
  const annotation = Object.assign({}, fakeAnnotation, options)
  return {
    filename: annotation.filename,
    subject: annotation.subject,
    documentbody: annotation.documentBody,
    annotationid: annotation.id,
    '_objectid_value': annotation.applicationId
  }
}

lab.beforeEach(() => {
  testAnnotation = new Annotation(fakeAnnotation)
  // Stub methods
  dynamicsCreateStub = DynamicsDalService.prototype.create
  DynamicsDalService.prototype.create = () => testAnnotationId

  dynamicsUpdateStub = DynamicsDalService.prototype.update
  DynamicsDalService.prototype.update = () => testAnnotationId

  dynamicsDeleteStub = DynamicsDalService.prototype.delete
  DynamicsDalService.prototype.delete = () => testAnnotationId

  dynamicsSearchStub = DynamicsDalService.prototype.search
})

lab.afterEach(() => {
  // Restore stubbed methods
  DynamicsDalService.prototype.create = dynamicsCreateStub
  DynamicsDalService.prototype.update = dynamicsUpdateStub
  DynamicsDalService.prototype.delete = dynamicsDeleteStub
  DynamicsDalService.prototype.search = dynamicsSearchStub
})

lab.experiment('Annotation Model tests:', () => {
  lab.test('getById() method correctly retrieves an Annotation object', async () => {
    DynamicsDalService.prototype.search = () => fakeDynamicsRecord()
    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    const annotation = await Annotation.getById('AUTH_TOKEN', fakeApplication.id)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(annotation.applicationId).to.equal(fakeAnnotation.applicationId)
    Code.expect(annotation.id).to.equal(fakeAnnotation.id)
  })

  lab.test('listByApplicationId() method returns a list of Annotation objects', async () => {
    const ids = ['ANNOTATION_ID_1', 'ANNOTATION_ID_2', 'ANNOTATION_ID_3']
    DynamicsDalService.prototype.search = () => {
      return {
        value: [
          fakeDynamicsRecord({id: ids[0]}),
          fakeDynamicsRecord({id: ids[1]}),
          fakeDynamicsRecord({id: ids[2]})]
      }
    }

    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    const annotationList = await Annotation.listByApplicationId(undefined, fakeApplication.id)
    Code.expect(Array.isArray(annotationList)).to.be.true()
    Code.expect(annotationList.length).to.equal(3)
    annotationList.forEach((annotation, index) => {
      Code.expect(annotation).to.equal(Object.assign({}, fakeAnnotation, {id: ids[index]}))
    })
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('save() method saves a new Annotation object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    await testAnnotation.save()
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testAnnotation.id).to.equal(testAnnotationId)
  })

  lab.test('save() method updates an existing Annotation object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'update')
    testAnnotation.id = testAnnotationId
    await testAnnotation.save()
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testAnnotation.id).to.equal(testAnnotationId)
  })

  lab.test('delete() method removes an existing Annotation object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'delete')
    testAnnotation.id = testAnnotationId
    await testAnnotation.delete()
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testAnnotation.id).to.equal(testAnnotationId)
  })
})