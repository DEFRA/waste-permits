'use strict'

const BaseValidator = require('./base.validator')

module.exports = class TaskListValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {}
  }

  setErrorMessages (taskList) {
    this.errorMessages = {
      'director-dobs-not-entered': {
        'any.required': `Enter a date of birth`
      }
    }

    // console.log('######task list:', taskList)
    // {{#each taskList.sections}}
    // <li>
    //   <h2 id="{{this.id}}" class="task-list-section">
    //     <span id="{{this.id}}-number" class="task-list-section-number">{{this.sectionNumber}}. </span><span id="{{this.id}}-heading">{{this.sectionName}}</span>
    //   </h2>

    //   <ul class="task-list-items">
    //     {{#each this.sectionItems}}
    //       {{#if this.available}}
    //         {{> common/taskListItem
    //           id=this.id
    //           label=this.label
    //           href=this.href
    //           completedLabelId=this.completedLabelId }}
    //       {{/if}}
    //     {{/each}}
    //   </ul>
    // </li>
    // {{/each}}

    for (let item of taskList.getVisibleItems()) {
      if (item.available) {
        this.errorMessages[item.id] = {
          'any.required': `Complete this task`
        }
      }
    }

    // THIS WORKED:

    // let index = 0
    // for (let section of taskList.sections) {
    //   for (let item of section.sectionItems) {
    //     if (item.available) {
    //       this.errorMessages[item.id] = {
    //         'any.required': `Complete this task`
    //       }
    //       index++
    //     }
    //   }
    // }

    // Iterate the task list items and build error messages for each applicable (visible) one
    // for (let i = 0; i < taskList.length; i++) {
    //   const director = directors[i]
    //   let daysInBirthMonth = 31
    //   if (director.dob && director.dob.month && director.dob.year) {
    //     daysInBirthMonth = moment(`${director.dob.year}-${director.dob.month}`, 'YYYY-MM').daysInMonth()
    //   }
    //   const directorName = `${director.firstName} ${director.lastName}`

    //   this.errorMessages[`director-dob-day-${i}`] = {
    //     'any.required': `Enter a date of birth for ${directorName}`,
    //     'invalid': `Enter a day between 1 and ${daysInBirthMonth} for ${directorName}`
    //   }
    // }
  }

  //   this.errorMessages = {
  //     'task-list-not-complete': {
  //       'any.required': `There are still some tasks to be completed`
  //     }
  //   }
  // }

  getFormValidators () {
    return {}
  }
}
