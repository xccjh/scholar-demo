import { createApp, App } from 'vue'
// import 'default-passive-events'
import AppRoot from './App.vue'
import { Antd, AntdIcon } from './assets/plugins'
import router from './app/router'
import store from './app/store'
import CommonPart from './common'
import startQiankun from '@/micro-config'
// import './registerServiceWorker'
import '../style/index.scss'
import { MenuServiceKey, MenuService } from '@/common/services'
import moment from 'moment'
import 'moment/locale/zh-cn'
import CKEditor from '@ckeditor/ckeditor5-vue'
import { ToolsUtil } from '@/common/utils'
moment.locale('zh-cn')
const { microStart } = require('../../package.json')
// import { prefetchApps } from 'qiankun'

// prefetchApps([
//   { name: 'scholar-sub', entry: '//locahost:8301/scholar-sub/#/scholar-sub/scholar-sub' },
//   { name: 'scholar-other-sub', entry: '//locahost:8302/scholar-other-sub/#/scholar-other-sub/scholar-other-sub' }
// ])
const app:App = createApp(AppRoot).use(store).use(router).use(CommonPart).use(Antd).use(AntdIcon).use(CKEditor)
app.provide(MenuServiceKey, new MenuService())
app.config.globalProperties.micro = {}
app.config.globalProperties.importedScript = {}
ToolsUtil.initTheme()

if (microStart === '1') {
  app.config.globalProperties.microApp = true
  startQiankun({
    singular: false,
    prefetch: 'all',
    excludeAssetFilter: (assetUrl: string) => {
      const whiteList: string[] = []
      const whiteWords = ['baidu', 'meiqia', 'cookie/flash.js']
      if (whiteList.includes(assetUrl)) {
        return true
      }
      return whiteWords.some(w => {
        return assetUrl.includes(w)
      })
    }
  })
}

app.mount('#app')
export { app, moment }
