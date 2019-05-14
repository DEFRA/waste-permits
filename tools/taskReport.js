const colors = require('colors/safe')
const taskLists = require('../src/tasks')

// This will output the state of the supplied tasklist
function report (tasklist) {
  tasklist.forEach(({ label, tasks }, index) => {
    console.log(colors.yellow(`${index + 1}. ${label}`))
    console.log('-------------------------------------------')
    tasks.forEach(({ label, route }) => {
      console.log(`     ${label}${route ? '' : colors.red(' **** NOT IMPLEMENTED ****')}`)
    })
    console.log()
  })
}

// Report on the implementation state of the bespoke tasklist

console.log('BESPOKE TASKLIST:')
console.log('===========================================')
report(taskLists.bespoke)
