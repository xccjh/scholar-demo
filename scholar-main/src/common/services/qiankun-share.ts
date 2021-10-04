import store from '@/app/store'
import { Json } from '@/common/base'
import { qiankunActions } from '@/micro-config'

class Shared {
  key
  constructor (key) {
    this.key = key
  }

  /**
   * 获取 UserInfo
   */
  public getUserInfo (): Json {
    return store.getters.userInfo
  }

  public setUserInfo (data) {
    store.commit('setUserInfo', data)
  }

  public getFilePreviewState (): Json {
    return store.getters.filePreviewState[this.key]
  }

  public getFilePreviewStateAll ():Json {
    return store.getters.filePreviewState
  }

  public setFilePreviewState (data) {
    store.commit('setFilePreviewState', {
      ...this.getFilePreviewStateAll(),
      [this.key]: data
    })
  }
}

const shared = new Shared('default')
export default shared
export {
  Shared
}
