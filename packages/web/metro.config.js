const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// Let Metro know where to resolve packages and which modules are in the monorepo
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Ensure TypeScript files are resolved
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx'];

// Add audio file extensions to asset extensions
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'mp3',
  'wav',
  'ogg',
];

module.exports = config;
