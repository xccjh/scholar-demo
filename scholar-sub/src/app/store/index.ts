import { createStore } from 'vuex'
import { DemoConstructStore } from '../views/demo-construct'
import { LocalStorageUtil } from '@/common/utils'
import { Json } from '@/common/base'

export default createStore<{
  loading: boolean;
  storeCount: number;
  userInfo: Json;
  filePreviewState: {
    [index: string]: {
      furl?: string,
      polywayId?: string,
      viewerId?: string,
      orgCode?: string,
      share?: '1'|'0',
      native?: '1'|'0',
      ow365?: '1'|'0',
      showTimer?:'1'|'0'
      filePreviewCallBack?:() => void
        };
        };
        }>({
          state: {
            loading: false,
            storeCount: 0,
            userInfo: {},
            filePreviewState: {}
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
            },
            setFilePreviewState (state, data) {
              state.filePreviewState = data
            }
          },
          getters: {
            storeCount (state, getters, rootState, rootGetters) {
              return state.storeCount + rootState.storeCount
            },
            userInfo (state, getters, rootState, rootGetters) {
              return state.userInfo.token ? state.userInfo : LocalStorageUtil.getUser()
            },
            filePreviewState (state, getters, rootState, rootGetters) {
              return state.filePreviewState
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
