import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import {
  registerMicroApps,
  start,
  addGlobalUncaughtErrorHandler,
  initGlobalState,
  setDefaultMountApp,
  MicroAppStateActions
} from 'qiankun'
// 注册子应用信息
import microApps from './micro-app-config'

const packageConfig = require('../../../package.json')

let qiankunActions :MicroAppStateActions
if (packageConfig.microStart === '1') {
  /***
   * 注册子应用
   * 第一个参数： 子应用的注册信息。
   * 第二个参数:  全局生命周期钩子。
   */
  registerMicroApps(microApps, {

    // qiankun 生命周期钩子 - 加载前
    beforeLoad: [(app) => {
      // 加载子应用前，加载进度条
      NProgress.start()
      console.log('before load', app.name)
      return Promise.resolve()
    }],

    // qiankun 生命周期钩子 - 挂载后
    afterMount: [(app) => {
      // 加载子应用前，进度条加载完成
      NProgress.done()
      console.log('after mount', app.name)
      return Promise.resolve()
    }],

    // qiankun 生命周期钩子 - 卸载后
    afterUnmount: [app => {
      console.log('[LifeCycle] after unmount %c%s', 'color: green;', app.name)
      return Promise.resolve()
    }]

  })

  // 设置默认启动的子应用
  // setDefaultMountApp(packageConfig.microAppSetting[process.env.VUE_APP_environment][packageConfig.microAppSetting.current].activeRule)
  qiankunActions = initGlobalState({})

  qiankunActions.onGlobalStateChange((state, prev) => {
    // state: 变更后的状态; prev 变更前的状态
    console.log(state, prev)
  })

  /***
   * 添加全局异常捕获处理器
   */
  addGlobalUncaughtErrorHandler(event => {
    console.error(event)
  })
}

// 导出 qiankun 的启动函数
export default start
export {
  qiankunActions
}
