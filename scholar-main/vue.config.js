const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const ThemeSwitchPlugin = require('@xccjh/vue3-theme-peel')
const ThemeColorReplacer = require('webpack-theme-color-replacer')
const client = require('webpack-theme-color-replacer/client')
const { generate } = require('@ant-design/colors/lib')
const productionGzipExtensions = ['js', 'css', 'txt', 'svg', 'eot', 'woff', 'ttf', 'svg', 'ico', 'png']
const { microAppSetting, microStart } = require('../package.json')
const microMainConfig = (microAppSetting[process.env.VUE_APP_environment] || [{ base: '' }])[0]

const deploy = process.env.VUE_APP_deploy === '1'
const sourseMap = process.env.VUE_APP_SourceMap === '1'
const https = process.env.VUE_APP_HTTPS === '1'
const port = deploy ? microMainConfig.port : microAppSetting.port
let publicPath = '/scholar/'
if (microStart === '1') {
  publicPath = `${https
  ? microMainConfig.host.indexOf('https') > -1
  ? microMainConfig.host : microMainConfig.host.replace('http', 'https')
  : microMainConfig.host}:${port}/scholar/`
  console.log('微服务访问地址:' + publicPath)
}

const { name } = require('./package')

function resolve (dir) {
  return path.join(__dirname, dir)
}
function getAntdSerials (color) {
  // 淡化（即less的tint）
  const lightens = new Array(9).fill(0).map((t, i) => {
    return client.varyColor.lighten(color, i / 10)
  })
  // colorPalette变换得到颜色值
  const colorPalettes = generate(color)
  const rgb = client.varyColor.toNum3(color.replace('#', '')).join(',')
  return lightens.concat(colorPalettes).concat(rgb)
}
module.exports = {
  publicPath,
  devServer: {
    disableHostCheck: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    compress: true,
    port,
    https: https ? {
      key: fs.readFileSync(path.join(__dirname, 'server/private.key')),
      cert: fs.readFileSync(path.join(__dirname, 'server/file.crt'))
    } : false,
    contentBase: [
      path.join(__dirname, 'local')
    ]
  },
  css: {
    // extract: false
    // sourceMap: false,
    loaderOptions: {
      sass: {
        // data: '@import "./theme/default/index.less";'
      },
      less: {
        javascriptEnabled: true
        // modifyVars: {
        //   'primary-color': '#00AB84'
        // }
        // modifyVars: {
        //   hack: `true; @import "${path.join(
        //     __dirname,
        //     './theme/default/index.less'
        //   )}";`
        // }
      }
    }
  },
  chainWebpack: config => {
    const newLoader = {
      loader: ThemeSwitchPlugin.loader,
      options: {}
    }
    ;['normal', 'vue-modules', 'vue', 'normal-modules'].forEach((item) => {
      ['css', 'scss', 'sass', 'less', 'stylus'].forEach((style) => {
        const originUse = config.module.rule(style).oneOf(item).toConfig().use
        originUse.splice(0, 1, newLoader)
        config.module.rule(style).oneOf(item).uses.clear()
        config.module.rule(style).oneOf(item).merge({ use: originUse })
      })
    })
    config
      .plugin('ThemeColorReplacer')
      .use(ThemeColorReplacer, [{
        fileName: 'css/theme-colors.css',
        externalCssFiles: deploy ? ['./node_modules/ant-design-vue/dist/antd.css'] : [],
        matchColors: getAntdSerials('#1890ff'), // 主色系列
        injectCss: true,
        // 改变样式选择器，解决样式覆盖问题
        changeSelector (selector) {
          switch (selector) {
            case '.ant-calendar-today .ant-calendar-date':
              return ':not(.ant-calendar-selected-date):not(.ant-calendar-selected-day)' + selector
            case '.ant-btn:focus,.ant-btn:hover':
              return '.ant-btn:focus:not(.ant-btn-primary):not(.ant-btn-danger),.ant-btn:hover:not(.ant-btn-primary):not(.ant-btn-danger)'
            case '.ant-btn.active,.ant-btn:active':
              return '.ant-btn.active:not(.ant-btn-primary):not(.ant-btn-danger),.ant-btn:active:not(.ant-btn-primary):not(.ant-btn-danger)'
            case '.ant-steps-item-process .ant-steps-item-icon > .ant-steps-icon':
            case '.ant-steps-item-process .ant-steps-item-icon>.ant-steps-icon':
              return ':not(.ant-steps-item-process)' + selector
            case '.ant-menu-horizontal>.ant-menu-item-active,.ant-menu-horizontal>.ant-menu-item-open,.ant-menu-horizontal>.ant-menu-item-selected,.ant-menu-horizontal>.ant-menu-item:hover,.ant-menu-horizontal>.ant-menu-submenu-active,.ant-menu-horizontal>.ant-menu-submenu-open,.ant-menu-horizontal>.ant-menu-submenu-selected,.ant-menu-horizontal>.ant-menu-submenu:hover':
            case '.ant-menu-horizontal > .ant-menu-item-active,.ant-menu-horizontal > .ant-menu-item-open,.ant-menu-horizontal > .ant-menu-item-selected,.ant-menu-horizontal > .ant-menu-item:hover,.ant-menu-horizontal > .ant-menu-submenu-active,.ant-menu-horizontal > .ant-menu-submenu-open,.ant-menu-horizontal > .ant-menu-submenu-selected,.ant-menu-horizontal > .ant-menu-submenu:hover':
              return '.ant-menu-horizontal > .ant-menu-item-active,.ant-menu-horizontal > .ant-menu-item-open,.ant-menu-horizontal > .ant-menu-item-selected,.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item:hover,.ant-menu-horizontal > .ant-menu-submenu-active,.ant-menu-horizontal > .ant-menu-submenu-open,.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu-selected,.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu:hover'
            case '.ant-menu-horizontal > .ant-menu-item-selected > a':
            case '.ant-menu-horizontal>.ant-menu-item-selected>a':
              return '.ant-menu-horizontal:not(ant-menu-light):not(.ant-menu-dark) > .ant-menu-item-selected > a'
            case '.ant-menu-horizontal > .ant-menu-item > a:hover':
            case '.ant-menu-horizontal>.ant-menu-item>a:hover':
              return '.ant-menu-horizontal:not(ant-menu-light):not(.ant-menu-dark) > .ant-menu-item > a:hover'
            default :
              return selector
          }
        }
      }]).before('html')
    if (deploy) {
      if (sourseMap) {
        config.devtool(false)
        config.plugin('SourceMapDevToolPlugin')
          .use(webpack.SourceMapDevToolPlugin).tap(args => {
            return [{
              filename: '[file].map',
              publicPath: '../',
              moduleFilenameTemplate: 'source-map'
            }]
          })
      } else {
        config.devtool(false)
      }
      config.optimization.minimizer('terser').tap(args => {
        args[0].sourceMap = sourseMap
        args[0].terserOptions.compress.warnings = false
        args[0].terserOptions.compress.drop_console = true
        args[0].terserOptions.compress.drop_debugger = true
        args[0].terserOptions.compress.pure_funcs = ['console.log']
        return args
      })

      config
        .plugins.delete('extract-css')
      config
        .plugin('ThemeSwitchPlugin')
        .use(ThemeSwitchPlugin, [{
          filename: 'css/[name].[hash:8].css',
          chunkFilename: 'css/[name].[contenthash:8].css'
        }]).before('html')
      config
        .plugin('ThemeSwitchPluginInject')
        .use(ThemeSwitchPlugin.inject, [{
          publicPath
        }])
    } else {
      config
        .plugin('ThemeSwitchPlugin')
        .use(ThemeSwitchPlugin.inject)
    }
    // config
    //   .plugin('webpack-bundle-analyzer')
    //   .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
    config.plugin('html').tap(args => {
      const param = args[0]
      param.minify = {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      }
      param.chunksSortMode = 'dependency'
      return [param]
    })
    config.module
      .rule('eslint')
      .use('eslint-loader')
      .loader('eslint-loader')
      .tap(options => {
        options.fix = true
        return options
      })
    config.module
      .rule('fonts')
      .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 4096, // 小于4kb将会被打包成 base64
        fallback: {
          loader: 'file-loader',
          options: {
            name: 'fonts/[name].[hash:8].[ext]',
            publicPath
          }
        }
      })
      .end()
    config.module
      .rule('images')
      .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 4096, // 小于4kb将会被打包成 base64
        fallback: {
          loader: 'file-loader',
          options: {
            name: 'img/[name].[hash:8].[ext]',
            publicPath
          }
        }
      })
    config.module.rules.delete('svg')
    config.module
      .rule('svg-sprite-loader')
      .test(/\.svg$/)
      .include
      .add(resolve('src/assets/svg'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: '[name]'
      })
    config.module
      .rule('svg-url-loader')
      .test(/\.svg$/)
      .exclude
      .add(resolve('src/assets/svg'))
      .end()
      .use('url-loader')
      .loader('url-loader')
      .options({
        name: 'img/[name].[hash:8].[ext]'
      })
    config.plugins.delete('prefetch')
    config
      .plugin('html')
      .tap(options => {
        options[0].title = '教研工作台'
        return options
      })
    if (deploy) {
      config.plugin('compression').use(CompressionWebpackPlugin, [{
        algorithm: 'gzip',
        test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
        threshold: 200, // 只有大小大于该值的资源会被处理 200
        minRatio: 0.6 // 只有压缩率小于这个值的资源才会被处理
        // deleteOriginalAssets: true // 删除原文件
      }])
    }
  },
  configureWebpack: {
    output: {
      library: `${name}-[name]`,
      libraryTarget: 'umd', // 把微应用打包成 umd 库格式
      jsonpFunction: `webpackJsonp_${name}`
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@layout': path.resolve(__dirname, 'layout'),
        '@theme': path.resolve(__dirname, 'theme'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@images': path.resolve(__dirname, 'src/assets/images'),
        '@common': path.resolve(__dirname, 'src/common'),
        '@views': path.resolve(__dirname, 'src/app/views'),
        '@api': path.resolve(__dirname, 'src/app/api')
      }
    },
    plugins: [
      // Ignore all locale files of moment.js
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ]
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [
        path.join(__dirname, 'style/_mixin.scss')
      ]
    }
  }
}
