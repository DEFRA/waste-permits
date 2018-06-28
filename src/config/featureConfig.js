const config = {}

config.hasLLPFeature = process.env.LLP_FEATURE === 'TRUE' || false

module.exports = config
