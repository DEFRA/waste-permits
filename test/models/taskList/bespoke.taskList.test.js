'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const BespokeTaskList = require('../../../src/models/taskList/bespoke.taskList')
const Task = require('../../../src/persistence/entities/task.entity')
const DataStore = require('../../../src/models/dataStore.model')

const availableTasks = []

const {
  tasks: {
    CLINICAL_WASTE_APPENDIX: { shortName: clinicalWasteShortName },
    MANAGE_HAZARDOUS_WASTE: { shortName: hazardousWasteShortName },
    PRE_APPLICATION_REFERENCE: { shortName: preApplicationShortName }
  }
} = require('../../../src/tasks')

const clinicalWasteTask = { shortName: clinicalWasteShortName, route: true }
const hazardousWasteTask = { shortName: hazardousWasteShortName, route: true }
const preApplicationTask = { shortName: preApplicationShortName, route: true }

let context
let sandbox
let mocks
let TestTaskList

lab.beforeEach(() => {
  mocks = new Mocks()

  context = mocks.context

  TestTaskList = new BespokeTaskList(context)

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(Task, 'getAvailableTasks').value(async () => availableTasks)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Bespoke Task List Model tests:', () => {
  lab.experiment('Clinical Waste', () => {
    lab.test('isAvailable() returns TRUE when the activity is not selected and the waste type is accepted', async () => {
      sandbox.stub(DataStore, 'get').value(() => { return { data: { acceptsClinicalWaste: true } } })

      const available = await TestTaskList.isAvailable(clinicalWasteTask)

      Code.expect(available).to.be.true()
    })

    lab.test('isAvailable() returns FALSE when the activity is selected and the waste type is not accepted', async () => {
      sandbox.stub(DataStore, 'get').value(() => { return { data: { acceptsClinicalWaste: false } } })
      availableTasks.push(clinicalWasteTask)

      const available = await TestTaskList.isAvailable(clinicalWasteTask)

      Code.expect(available).to.be.false()
    })
  })

  lab.experiment('Hazardous Waste', () => {
    lab.test('isAvailable() returns TRUE when the activity is not selected and the waste type is accepted', async () => {
      sandbox.stub(DataStore, 'get').value(() => { return { data: { acceptsHazardousWaste: true } } })

      const available = await TestTaskList.isAvailable(hazardousWasteTask)

      Code.expect(available).to.be.true()
    })

    lab.test('isAvailable() returns FALSE when the activity is selected and the waste type is not accepted', async () => {
      sandbox.stub(DataStore, 'get').value(() => { return { data: { acceptsHazardousWaste: false } } })
      availableTasks.push(hazardousWasteTask)

      const available = await TestTaskList.isAvailable(hazardousWasteTask)

      Code.expect(available).to.be.false()
    })
  })

  lab.experiment('Pre Application', () => {
    lab.test('isAvailable() returns TRUE when pre-application advice has been received', async () => {
      sandbox.stub(DataStore, 'get').value(() => { return { data: { receivedPreApplicationAdvice: true } } })
      availableTasks.push(preApplicationTask)

      const available = await TestTaskList.isAvailable(preApplicationTask)

      Code.expect(available).to.be.true()
    })

    lab.test('isAvailable() returns FALSE when  pre-application advice has not been received', async () => {
      sandbox.stub(DataStore, 'get').value(() => { return { data: { receivedPreApplicationAdvice: false } } })
      availableTasks.push(preApplicationTask)

      const available = await TestTaskList.isAvailable(preApplicationTask)

      Code.expect(available).to.be.false()
    })
  })
})
