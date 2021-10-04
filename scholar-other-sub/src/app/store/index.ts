import { createStore } from 'vuex'
import { DemoConstructStore } from '../views/demo-construct'
import { LocalStorageUtil } from '@/common/utils'
import { Json } from '@/common/base'

export default createStore<{
  loading: boolean;
  storeCount: number;
  userInfo: Json
}>({
  state: {
    loading: false,
    storeCount: 0,
    userInfo: {}
  },
  mutations: {
    // loading
    setLoading (state, data) {
      state.loading = data
    },
    increment (state, data) {
      state.storeCount++
    },
    setUserInfo (state, data) {
      state.userInfo = data
      LocalStorageUtil.putUser(data)
    }
  },
  getters: {
    storeCount (state, getters, rootState, rootGetters) {
      return state.storeCount + rootState.storeCount
    },
    userInfo (state, getters, rootState, rootGetters) {
      return state.userInfo.token ? state.userInfo : LocalStorageUtil.getUser()
    }
  },
  actions: {
    // loading
    setActionsLoading ({ dispatch, commit, getters, rootGetters }, data) {
      commit('setLoading', data)
    }
  },
  modules: {
    DemoConstructStore
  }
})
