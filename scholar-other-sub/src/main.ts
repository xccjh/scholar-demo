import './public-path'
import { createApp } from 'vue'
import 'default-passive-events'
import App from './App.vue'
import '../style/index.scss'
import { Antd } from './assets/plugins'
import './registerServiceWorker'
import router from './app/router'
import store from './app/store'
import CommonPart from './common'
import { Json } from '@/common/base'
import { win } from '@/common/base/common'
import { QiankunActionsInstance, SharedModule } from '@/common/services'

declare const window: win

let instance
const qiankun = window.__POWERED_BY_QIANKUN__

function render (props:Json = {}) {
  if (props) {
    // 注入 actions 实例
    QiankunActionsInstance.setActions(props)
    const { shared = SharedModule.getShared() } = props
    SharedModule.overloadShared(shared)
  }
  const { container } = props

  instance = createApp(App).use(store).use(router).use(CommonPart).use(Antd)
  instance.config.globalProperties.qiankun = qiankun
  instance.mount(container ? container.querySelector('#app') : '#app')
}

// 独立运行时
if (!qiankun) {
  render()
}

export async function bootstrap () {
  console.log('[vue] vue app bootstraped')
}
export async function mount (props) {
  console.log('[vue] props from main framework', props)
  render(props)
}
export async function unmount () {
  instance.unmount()
  instance = null
}

// 增加 update 钩子以便主应用手动更新微应用
export async function update (props) {
  // renderPatch(props);
  console.log(props)
}

export default instance
