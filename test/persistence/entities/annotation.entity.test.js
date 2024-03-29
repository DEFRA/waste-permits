'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const Annotation = require('../../../src/persistence/entities/annotation.entity')
const dynamicsDal = require('../../../src/services/dynamicsDal.service')

let sandbox

let testAnnotation
const testAnnotationId = 'ANNOTATION_ID'

const fakeApplication = {
  id: 'APPLICATION_ID'
}

const fakeAnnotation = {
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
    annotationid: annotation.id,
    _objectid_value: annotation.applicationId
  }
}

const context = { }

lab.beforeEach(() => {
  testAnnotation = new Annotation(fakeAnnotation)

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(dynamicsDal, 'create').value(() => testAnnotationId)
  sandbox.stub(dynamicsDal, 'update').value(() => testAnnotationId)
  sandbox.stub(dynamicsDal, 'delete').value(() => testAnnotationId)
  sandbox.stub(dynamicsDal, 'search').value(() => {})
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Annotation Entity tests:', () => {
  lab.test('getById() method correctly retrieves an Annotation object', async () => {
    dynamicsDal.search = () => fakeDynamicsRecord()
    const spy = sinon.spy(dynamicsDal, 'search')
    const annotation = await Annotation.getById(context, testAnnotationId)
    Code.expect(spy.callCount).to.equal(1)
    testAnnotation.id = testAnnotationId
    Code.expect(annotation).to.equal(testAnnotation)
  })

  lab.test('listByApplicationIdAndSubject() method returns a list of Annotation objects', async () => {
    const ids = ['ANNOTATION_ID_1', 'ANNOTATION_ID_2', 'ANNOTATION_ID_3']
    dynamicsDal.search = () => {
      return {
        value: [
          fakeDynamicsRecord({ id: ids[0] }),
          fakeDynamicsRecord({ id: ids[1] }),
          fakeDynamicsRecord({ id: ids[2] })]
      }
    }

    const spy = sinon.spy(dynamicsDal, 'search')
    const annotationList = await Annotation.listByApplicationIdAndSubject(context, fakeApplication.id)
    Code.expect(Array.isArray(annotationList)).to.be.true()
    Code.expect(annotationList.length).to.equal(3)
    annotationList.forEach((annotation, index) => {
      Code.expect(annotation).to.equal(Object.assign({}, fakeAnnotation, { id: ids[index] }))
    })
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('save() method saves a new Annotation object', async () => {
    const spy = sinon.spy(dynamicsDal, 'create')
    await testAnnotation.save(context)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testAnnotation.id).to.equal(testAnnotationId)
  })

  lab.test('save() method updates an existing Annotation object', async () => {
    const spy = sinon.spy(dynamicsDal, 'update')
    testAnnotation.id = testAnnotationId
    await testAnnotation.save(context)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testAnnotation.id).to.equal(testAnnotationId)
  })

  lab.test('delete() method removes an existing Annotation object', async () => {
    const spy = sinon.spy(dynamicsDal, 'delete')
    testAnnotation.id = testAnnotationId
    await testAnnotation.delete(context)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testAnnotation.id).to.equal(testAnnotationId)
  })
})
