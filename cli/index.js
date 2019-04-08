const inquirer = require('inquirer')
const fs = require('fs-extra')
const routes = require('../src/routes')
const utilities = require('../src/utilities/utilities')
const View = require('./view.template')
const Validator = require('./validator.template')
const Controller = require('./controller.template')

function error (message) {
  console.log(`
            >>>> ${message}`)
}

function snakeToCamel (string) {
  return string.toLowerCase().replace(/(_\w)/g, function (matches) { return matches[1].toUpperCase() })
}

function buildFilename (type, name) {
  let fileType = type === 'view' ? 'html' : `${type}.js`
  return `./src/${type}s/${name}.${fileType}`
}

function saveFile (filename, data) {
  fs.ensureFile(filename, (err) => {
    if (err) throw err
    // file has now been created, including the directory it is to be placed in
    fs.appendFile(filename, data + '\n', 'utf8', (err) => {
      if (err) throw err
      // if no error
      console.log(`${filename} has been created successfully.`)
    })
  })
}

class RouteGenerator {
  constructor () {
    console.log()
    console.log('Hi, welcome to the route generator')
    console.log('==================================')
    console.log()
  }

  async getRouteId () {
    return inquirer.prompt({
      type: 'input',
      name: 'routeId',
      message: 'Route ID eg: "MY_ROUTE": ',
      validate: (routeId) => {
        if (routeId) {
          if (routes[routeId]) {
            error(`Route ID "${routeId}" already exists!`)
          } else {
            if (routeId.match(/^([A-Z]([A-Z_]*[A-Z0-9])?)+$/)) {
              return true
            } else {
              error(`Route ID "${routeId}" is invalid!`)
            }
          }
        }
      }
    })
  }

  async getNextRoute (defaultVal) {
    return inquirer.prompt({
      type: 'input',
      name: 'nextRoute',
      message: 'Next route eg: "NEXT_ROUTE": ',
      default: defaultVal,
      validate: (nextRoute) => {
        if (nextRoute) {
          if (routes[nextRoute]) {
            return true
          } else {
            if (nextRoute.match(/^([A-Z]([A-Z_]*[A-Z0-9])?)+$/)) {
              return true
            } else {
              error(`Route ID "${nextRoute}" is invalid!`)
            }
          }
        }
      }
    })
  }

  async getPath (defaultVal) {
    return inquirer.prompt({
      type: 'input',
      name: 'path',
      message: 'Path eg: "/my/route-path": ',
      default: defaultVal,
      validate: (path) => {
        if (path.match(/^(\/[a-z]([a-z-]*[a-z])?)+$/)) {
          const routeList = Object.entries(routes)
            .map(([routeId, route]) => route)

          let matchingRoute = routeList
            .find((route) => !route.params && route.path === path)

          if (!matchingRoute) {
            matchingRoute = routeList
              .filter((route) => route.params && `${path}/`.startsWith(`${route.path}/`))
              .find((route) => {
                const params = (route.params || [])
                const optionalParams = params.filter((param) => !param.includes('?'))
                const pathLength = path.split('/').length
                const routePathLength = route.path.split('/').length
                return pathLength === routePathLength + params.length || pathLength === routePathLength + optionalParams.length
              })
          }

          if (matchingRoute) {
            let matchingPath = matchingRoute.path
            if (matchingRoute.params) {
              matchingPath += matchingRoute.params.join('}/{')
            }
            error(`Path "${path}" already matches existing path "${matchingPath}}"!`)
          } else {
            return true
          }
        } else {
          error(`Path "${path}" is invalid!`)
        }
      }
    })
  }

  async getRouteParam (params = []) {
    const { param } = await inquirer.prompt({
      type: 'input',
      name: 'param',
      message: 'Route parameter eg: "myRouteParameter" or "myRouteParameter?": ',
      default: '',
      validate: (param) => {
        if (!param) {
          return true
        }
        const [ parameter ] = param.split('?')
        if (params.includes(parameter) || params.includes(`${parameter}?`)) {
          error(`Route Parameter "${param}" already added!`)
        } else {
          if (param.match(/^([a-z]([a-zA-Z0-9]*)?)+(\?)?$/)) {
            return true
          } else {
            error(`Route Parameter "${param}" is invalid!`)
          }
        }
      }
    })
    if (param) {
      params.push(param)
      if (param.endsWith('?')) {
        // Only the last parameter can be optional
      } else {
        await this.getRouteParam(params)
      }
    }
    return { params: params.length ? params : undefined }
  }

  async getView (defaultVal, isUpload) {
    if (!isUpload && defaultVal) {
      const { confirm } = await this.getConfirm(`Is a view required? `)
      if (!confirm) {
        return {}
      }
    }

    const { view } = await inquirer.prompt({
      type: 'input',
      name: 'view',
      message: 'View eg: "myView": ',
      default: defaultVal,
      validate: (view) => {
        if (view.match(/^([a-z]([a-zA-Z0-9]*)\/?)+$/)) {
          return true
        } else {
          error(`View "${view}" is invalid!`)
        }
      }
    })

    const file = buildFilename('view', view)

    if (fs.existsSync(file)) {
      const { confirm } = await this.getConfirm(`View "${file}" already exists. Reuse? `)
      if (confirm) {
        return { view }
      }
    } else {
      const { confirm } = await this.getConfirm(`View "${file}" doesn't exist. Create? `)
      if (confirm) {
        const { confirm: hasBackLink } = await this.getConfirm(`Does this view contain a back link? `)
        const { confirm: hasSubmitButton } = isUpload ? { confirm: true } : await this.getConfirm(`Does this view contain a submit button? `)
        return { view, isNewView: true, hasBackLink, hasSubmitButton }
      }
    }

    return this.getView(defaultVal)
  }

  async getPageHeading (defaultVal) {
    let { pageHeading } = await inquirer.prompt({
      type: 'input',
      name: 'pageHeading',
      message: 'Page heading eg "My Page Heading"',
      default: defaultVal
    })
    if (!pageHeading) {
      const { confirm } = await this.getConfirm(`You did not enter a page heading, is this correct? `)
      if (!confirm) {
        return this.getPageHeading()
      }
    }
    return { pageHeading }
  }

  async getConfirm (message, defaultVal = true) {
    return inquirer.prompt({
      type: 'confirm',
      name: 'confirm',
      message,
      default: defaultVal
    })
  }

  async getController (defaultVal) {
    const { controller } = await inquirer.prompt({
      type: 'input',
      name: 'controller',
      message: 'Controller eg: "myController"',
      default: defaultVal,
      validate: (controller) => {
        if (controller.match(/^([a-z]([a-zA-Z0-9]*)\/?)+$/)) {
          return true
        } else {
          error(`Controller "${controller}" is invalid!`)
        }
      }
    })

    let isUpload = (controller === 'upload') || (await this.getConfirm(`Is ${controller} an upload controller? `, false)).confirm

    const file = buildFilename('controller', controller)

    if (fs.existsSync(file)) {
      const { confirm } = await this.getConfirm(`Controller "${file}" already exists. Reuse? `)
      if (confirm) {
        return { controller, isUpload }
      }
    } else {
      const { confirm } = await this.getConfirm(`Controller "${file}" doesn't exist. Create? `)
      if (confirm) {
        return { controller, isUpload, isNewController: true }
      }
    }

    return this.getController(defaultVal)
  }

  async getValidator (defaultVal) {
    if (defaultVal) {
      const { confirm } = await this.getConfirm(`Is a validator required? `)
      if (!confirm) {
        return {}
      }
    }

    const { validator } = await inquirer.prompt({
      type: 'input',
      name: 'validator',
      message: 'Validator eg: "myValidator"',
      default: defaultVal,
      validate: (validator) => {
        if (validator.match(/^([a-z]([a-zA-Z0-9]*)\/?)+$/)) {
          return true
        } else {
          error(`Validator "${validator}" is invalid!`)
        }
      }
    })

    const file = buildFilename('validator', validator)

    if (fs.existsSync(file)) {
      const { confirm } = await this.getConfirm(`Validator "${file}" already exists. Reuse? `)
      if (confirm) {
        return { validator }
      }
    } else {
      const { confirm } = await this.getConfirm(`Validator "${file}" doesn't exist. Create? `)
      if (confirm) {
        return { validator, isNewValidator: true }
      }
    }
    return this.getValidator('')
  }
}

/// ////////////// ///
/// Entry point => ///
/// ////////////// ///

(async () => {
  const routeGenerator = new RouteGenerator()

  const { routeId } = await routeGenerator.getRouteId()
  const { path } = await routeGenerator.getPath(`/${routeId.replace(/_/g, `-`).toLowerCase()}`)
  const { params } = await routeGenerator.getRouteParam()
  const { controller, isUpload, isNewController } = await routeGenerator.getController(snakeToCamel(routeId))
  const { view, isNewView, hasBackLink, hasSubmitButton } = await routeGenerator.getView(controller, isUpload)
  const { pageHeading } = view ? await routeGenerator.getPageHeading(utilities.capitalizeFirstLetter(routeId.replace(/_/g, ` `).toLowerCase())) : {}
  const { validator, isNewValidator } = isUpload ? { validator: 'upload' } : view ? await routeGenerator.getValidator(controller) : {}
  const { nextRoute } = await routeGenerator.getNextRoute('TASK_LIST')
  const types = `GET${isUpload ? ', REMOVE, UPLOAD' : hasSubmitButton ? ', POST' : ''}`
  const baseRoute = isUpload ? 'uploadRoute' : ''
  const subject = isUpload ? 'ARBITRARY_UPLOADS' : ''

  const route = {
    path,
    params,
    view,
    pageHeading,
    controller,
    validator,
    nextRoute,
    types,
    baseRoute,
    subject
  }

  // Remove falsy properties
  Object.keys(route)
    .filter(key => !route[key])
    .forEach((key) => delete route[key])

  console.log(route)

  if (isNewController) {
    const options = { controllerName: utilities.capitalizeFirstLetter(controller), hasView: !!view, hasSubmitButton }
    saveFile(buildFilename('controller', controller), isUpload ? Controller.getUploadTemplate(options) : Controller.getBaseTemplate(options))
  }

  if (isNewView) {
    saveFile(buildFilename('view', view), View.getTemplate({ hasBackLink, hasSubmitButton, hasPageHeading: !!pageHeading, hasValidator: !!validator, isUpload }))
  }

  if (isNewValidator) {
    saveFile(buildFilename('validator', validator), Validator.getTemplate({ validatorName: utilities.capitalizeFirstLetter(validator) }))
  }

  // Format and add route to routes file
  const props = Object.entries(route)
    .map(([prop, val]) => `${prop}: ${JSON.stringify(val)}`.replace(/"/g, `'`))
    .join(`,
     `)

  saveFile('./src/routes.js', `Routes.${routeId} =
   {
     ${props}
   }
  `)
})()
