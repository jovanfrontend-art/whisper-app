const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// Merge monorepo watchFolders with Expo's defaults (not replace them)
config.watchFolders = [...(config.watchFolders || []), workspaceRoot]

// Resolve modules from both the project and workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

// Force React and React Native to always resolve from the app's node_modules
// to prevent duplicate React instances in pnpm monorepos
const FORCED_FROM_APP = ['react', 'react-native', 'react/jsx-runtime', 'react/jsx-dev-runtime']

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (FORCED_FROM_APP.includes(moduleName)) {
    return context.resolveRequest(
      { ...context, originModulePath: path.join(projectRoot, 'index.js') },
      moduleName,
      platform
    )
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
