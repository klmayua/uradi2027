module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['module-resolver', {
        root: ['./src'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@services': './src/services',
          '@database': './src/database',
          '@hooks': './src/hooks',
          '@utils': './src/utils',
          '@navigation': './src/navigation'
        }
      }]
    ]
  };
};
