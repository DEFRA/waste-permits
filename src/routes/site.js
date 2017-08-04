module.exports = [{
  method: ['GET', 'POST'],
  path: '/site',
  handler: (request, reply) => {
    // console.log(request)
    // console.log(request.payload)
    // console.log(request.method)
    // console.log('Requested site page')
    const context = {
      pageTitle: 'Waste Permits - Site',
      title: 'This is the site page!',
      message: 'Hello, World!'
    }

    if (request.method === 'post') {
      // TODO validate post data using Joi
      let valid = true

      valid = (request.payload.siteName === 'test')

      // TODO if valid, persist the data
      if (valid) {
        console.log('#Persist data: ' + request.payload.siteName)


        
        return reply.redirect('/task-list')
      } else {
        context.errors = {
          message: 'Invalid site name: [' + request.payload.siteName + ']'
        }
      }
    }

    return reply.view('site/site', context)
  }
}]
