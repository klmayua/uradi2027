const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Support for path aliases matching tsconfig.json
config.resolver.alias = {
  ...config.resolver.alias,
  '@': path.resolve(__dirname, 'src'),
  '@components': path.resolve(__dirname, 'src/components'),
  '@screens': path.resolve(__dirname, 'src/screens'),
  '@services': path.resolve(__dirname, 'src/services'),
  '@database': path.resolve(__dirname, 'src/database'),
  '@stores': path.resolve(__dirname, 'src/stores'),
  '@hooks': path.resolve(__dirname, 'src/hooks'),
  '@utils': path.resolve(__dirname, 'src/utils'),
  '@navigation': path.resolve(__dirname, 'src/navigation'),
  '@models': path.resolve(__dirname, 'src/models'),
  '@theme': path.resolve(__dirname, 'src/theme'),
  '@branding': path.resolve(__dirname, 'branding'),
  '@constants': path.resolve(__dirname, 'src/constants'),
};

// WatermelonDB requirement
config.resolver.sourceExts = [
  'js',
  'jsx',
  'json',
  'ts',
  'tsx',
  'mjs',
  'wasm',
];

module.exports = config;
