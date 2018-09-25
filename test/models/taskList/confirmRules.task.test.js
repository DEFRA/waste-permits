'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const ConfirmRules = require('../../../src/models/taskList/confirmRules.task')

const COMPLETENESS_PARAMETER = 'defra_confirmreadrules_completed'

lab.experiment('Task List: ConfirmRules Model tests:', () => {
  lab.test(`completenessParameter is ${COMPLETENESS_PARAMETER}`, async () => {
    Code.expect(ConfirmRules.completenessParameter).to.equal(COMPLETENESS_PARAMETER)
  })
})
