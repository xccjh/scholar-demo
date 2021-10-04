import { createStore } from 'vuex'
import { DemoConstructStore } from '../views/demo-construct'
import { LocalStorageUtil } from '@/common/utils'
import { Json, PreviewFileOption } from '@/common/base'
import { SystemManageStore } from '@/app/views/system-manage'
import { CourseManageStore } from '@/app/views/course-manage'
import { ArchivesManageStore } from '@/app/views/archives-manage'
import { ResourceManageStore } from '@/app/views/resource-manage'

interface StateModel {
  loading: boolean;
  storeCount: number;
  userInfo: Json;
  keepLiveRoute: string[];
  codeUid: string;
  logo: string,
  filePreviewState: {
    [index: string]: Partial<PreviewFileOption>
  }
}

const stateInit: StateModel = {
  loading: false,
  logo: '',
  storeCount: 0,
  codeUid: '',
  userInfo: {},
  filePreviewState: {},
  keepLiveRoute: []
}

export default createStore<StateModel>({
  state: JSON.parse(JSON.stringify(stateInit)),
  mutations: {
    /**
     * 全局loading
     * @param state
     * @param data
     */
    setLoading (state, data) {
      state.loading = data
    },
    increment (state, data) {
      state.storeCount++
    },
    setUserInfo (state, data) {
      state.userInfo = data
      LocalStorageUtil.putUser(data)
    },
    setCodeUid (state, data) {
      state.codeUid = data
      LocalStorageUtil.putCodeUid(data)
    },
    setFilePreviewState (state, data) {
      state.filePreviewState = data
    },
    setLogo (state, data) {
      state.logo = data
    },
    removeKeepLiveRouteItem (state, key) {
      if (state.keepLiveRoute.length > 0) {
        state.keepLiveRoute = state.keepLiveRoute.filter(item => item !== key)
      }
      console.log('清除缓存路由' + key + '！')
    },
    addKeepLiveRouteItem (state, key) {
      const index = state.keepLiveRoute.findIndex(item => item === key)
      if (index < 0) {
        state.keepLiveRoute.push(key)
      }
      console.log(('增加缓存路由' + key + '！'))
    },
    removeKeepLiveRoute (state) {
      if (state.keepLiveRoute.length > 0) state.keepLiveRoute = []
      console.log('清空缓存路由！')
    },
    resetState (state) {
      Object.keys(stateInit).forEach(key => {
        state[key] = stateInit[key]
      })
    }
  },
  getters: {
    storeCount (state, getters, rootState, rootGetters) {
      return state.storeCount + rootState.storeCount
    },
    userInfo (state, getters, rootState, rootGetters) {
      return state.userInfo.token ? state.userInfo : LocalStorageUtil.getUser()
    },
    codeUid (state, getters, rootState, rootGetters) {
      return state.codeUid ? state.codeUid : LocalStorageUtil.getCodeUid()
    },
    filePreviewState (state, getters, rootState, rootGetters) {
      return state.filePreviewState
    },
    keepLiveRoute (state, getters, rootState, rootGetters) {
      return state.keepLiveRoute
    },
    logo (state, getters, rootState, rootGetters) {
      return state.logo
    }
  },
  actions: {
    /**
     * 全局loading
     * @param dispatch
     * @param commit
     * @param getters
     * @param rootGetters
     * @param data
     */
    setActionsLoading ({ dispatch, commit, getters, rootGetters }, data) {
      commit('setLoading', data)
    }
  },
  modules: {
    DemoConstructStore,
    SystemManageStore,
    CourseManageStore,
    ArchivesManageStore,
    ResourceManageStore
  }
})
