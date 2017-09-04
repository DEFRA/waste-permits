'use strict'

module.exports = {
  PAGE_TITLE_ERROR_PREFIX: 'Problem: ',
  SERVICE_NAME: 'Waste Permits',
  GDS_NAME: 'GOV.UK',

  COOKIE_KEY: 'DefraSession',

  Routes: {
    ROOT: {
      path: '/',
      pageHeading: 'Waste Permits Home Page'
    },
    ERROR: {
      path: '/error',
      pageHeading: 'Something went wrong'
    },
    SITE: {
      path: '/site',
      pageHeading: `What's the site name?`
    },
    CONTACT: {
      path: '/contact',
      pageHeading: 'Who should we contact about this application?'
    },
    TASK_LIST: {
      path: '/task-list',
      pageHeading: 'Task List'
    }
  }
}
