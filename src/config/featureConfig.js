const config = {}

// Add feature switches here such as the example hasLLPFeature below
// config.hasLLPFeature = process.env.LLP_FEATURE === 'TRUE' || false
config.hasBespokeFeature = process.env.BESPOKE_FEATURE === 'TRUE' || false
config.hasDisplayRecoveryLinkFeature = process.env.DISPLAY_RECOVERY_LINK_FEATURE === 'TRUE' || false
config.hasMcpFeature = process.env.MCP_FEATURE === 'TRUE' || false

module.exports = config
