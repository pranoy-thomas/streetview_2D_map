const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  
  // Configure dev server proxy to forward API requests to backend
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        }
      }
    }
  },
  
  // Public path for production builds
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  
  // Output directory for production builds
  outputDir: 'dist',
  
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[hash:7].[ext]',
                outputPath: 'assets/img/',
              },
            },
          ],
        },
      ]
    }
  },
  
  chainWebpack: config => {
    // Allow importing Leaflet CSS
    config.module
      .rule('css')
      .oneOf('vue-modules')
      .use('css-loader')
      .tap(options => {
        if (options.modules) {
          options.modules.exportOnlyLocals = false;
        }
        return options;
      });
  }
});