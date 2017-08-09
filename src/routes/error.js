module.exports = [{
  method: ['GET'],
  path: '/error',
  handler: (request, reply) => {
    const context = {
      pageTitle: 'Waste Permits - Error'
    }

    return reply
      .view('error', context)
  }
}]
