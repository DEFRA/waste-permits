module.exports = [{
  method: 'GET',
  path: '/',
  handler: (request, reply) => {
    // console.log('Requested index page')
    const context = {
      pageTitle: 'Waste Permits'
    }

    reply.view('index', context)
  }
}]
