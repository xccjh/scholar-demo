import store from '@/app/store'

class Shared {
  getUserInfo () {
    // 子应用独立运行时，在 localStorage 中获取 token
    return store.getters.userInfo
  }

  setUserInfo (data) {
    store.commit('setUserInfo', data)
  }
}

class SharedModule {
  static shared:any = new Shared();

  /**
   * 重载 shared
   */
  static overloadShared (shared:any) {
    SharedModule.shared = shared
  }

  /**
   * 获取 shared 实例
   */
  static getShared () {
    return SharedModule.shared
  }
}

export default SharedModule
