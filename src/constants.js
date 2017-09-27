'use strict'

const fs = require('fs')

const Constants = module.exports = {}

Constants.SERVICE_NAME = 'Waste Permits'
Constants.GDS_NAME = 'GOV.UK'
Constants.COOKIE_KEY = 'DefraSession'
Constants.COOKIE_PATH = { path: '/' }
Constants.GITHUB_LOCATION = 'https://github.com/DEFRA/waste-permits'
Constants.TIMESTAMP_FORMAT = 'DD/MM/YYYY HH:mm:ss'
Constants.PAGE_TITLE_ERROR_PREFIX = 'Problem: '
Constants.SKIP_LINK_MESSAGE = `Skip to main content`

Constants.LogLevel = {
  ERROR: 'ERROR',
  INFO: 'INFO'
}

Constants.Routes = {
  ROOT: {
    path: '/',
    pageHeading: 'Waste Permits Home Page'
  },
  CHECK_BEFORE_SENDING: {
    path: '/check-before-sending',
    pageHeading: 'Check your answers before sending your application',
    taskListHeading: 'Send application and pay'
  },
  CHECK_YOUR_EMAIL: {
    path: '/save-and-return/check-your-email',
    pageHeading: `Search for 'standard rules permit application' in your email`,
    taskListHeading: `Search for 'standard rules permit application' in your email`
  },
  CONFIDENTIALITY: {
    path: '/confidentiality',
    pageHeading: 'Is part of your application commercially confidential?',
    taskListHeading: 'Confirm confidentiality needs'
  },
  CONFIRM_RULES: {
    path: '/confirm-rules',
    pageHeading: 'Confirm that your operation meets the rules',
    taskListHeading: 'Confirm that your operation meets the rules'
  },
  CONTACT_DETAILS: {
    path: '/contact-details',
    pageHeading: 'Who should we contact about this application?',
    taskListHeading: 'Give contact details'
  },
  CONTACT_SEARCH: {
    path: '/contact-search',
    pageHeading: 'Contact search',
    taskListHeading: 'Contact search'
  },
  COST_TIME: {
    path: '/cost-time',
    pageHeading: 'Cost and time for this permit',
    taskListHeading: 'Cost and time for this permit'
  },
  DRAINAGE_TYPE_DRAIN: {
    path: '/drainage-type/drain',
    pageHeading: 'Declaration for vehicle storage, depolution and dismantling facilities',
    taskListHeading: 'Confirm the drainage system for your site'
  },
  ERROR: {
    path: '/error',
    pageHeading: 'Something went wrong'
  },
  FIRE_PREVENTION_PLAN: {
    path: '/fire-prevention-plan',
    pageHeading: 'Upload the fire prevention plan',
    taskListHeading: 'Upload the fire prevention plan'
  },
  HEALTH: {
    path: '/health',
    pageHeading: 'Health'
  },
  MANAGEMENT_SYSTEM: {
    path: '/management-system',
    pageHeading: 'Which management system will you use?',
    taskListHeading: 'Tell us which management system you use'
  },
  PAGE_NOT_FOUND: {
    path: '/page-not-found',
    pageHeading: `We can't find that page`
  },
  PERMIT_CATEGORY: {
    path: '/permit/category',
    pageHeading: 'What do you want the permit for?'
  },
  PERMIT_HOLDER_TYPE: {
    path: '/permit-holder/type',
    pageHeading: 'Who will be the permit holder?',
    taskListHeading: 'Give permit holder details'
  },
  PERMIT_SELECT: {
    path: '/permit/select',
    pageHeading: 'Select a permit'
  },
  PRE_APPLICATION: {
    path: '/pre-application',
    pageHeading: 'Have you discussed this application with us?',
    taskListHeading: `Tell us if you've discussed this application with us`
  },
  SITE_PLAN: {
    path: '/site-plan',
    pageHeading: 'Upload the site plan',
    taskListHeading: 'Upload the site plan'
  },
  SITE_SITE_NAME: {
    path: '/site/site-name',
    pageHeading: `What's the site name?`,
    taskListHeading: 'Give site name and location'
  },
  START_OR_OPEN_SAVED: {
    path: `/start/start-or-open-saved`,
    pageHeading: 'Apply for a standard rules waste permit'
  },
  TASK_LIST: {
    path: '/task-list',
    pageHeading: 'Apply for a standard rules waste permit'
  },
  TECHNICAL_QUALIFICATION: {
    path: '/technical-qualification',
    pageHeading: 'Which qualification does the person providing technical management have?',
    taskListHeading: 'Upload technical management qualifications'
  },
  VERSION: {
    path: '/version',
    pageHeading: 'Waste Permits'
  }
}

Constants.PermitTypes = {
  STANDARD_RULES: {
    cost: {
      lower: 720,
      upper: 1690
    }
  }
}

Constants.buildPageTitle = (pageHeading) => {
  return `${pageHeading} - ${Constants.SERVICE_NAME} - ${Constants.GDS_NAME}`
}

Constants.getVersion = () => {
  let version
  try {
    // Read the application version number
    let json = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    if (json) {
      version = json.version
    } else {
      throw new Error('Application version not found')
    }
  } catch (err) {
    version = 'Unknown'
  }
  return version
}
