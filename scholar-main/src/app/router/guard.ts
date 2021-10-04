import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import store from '../store'
import { gotoReview, microhandler } from '@/common/utils'

const { mainBase, mainLayoutIndex } = require('../../../../package.json')

export const guard = (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  if (to.fullPath !== from.fullPath) { // 修复vue3路由异步更新bug
    if (to.path === '/p/login') {
      if (store.getters.userInfo.token) {
        microhandler(() => {
          gotoReview(mainBase + mainLayoutIndex)
          next()
        })
      } else {
        microhandler(() => {
          next()
        })
      }
    } else {
      if (store.getters.userInfo.token) {
        microhandler(() => {
          next()
        })
      } else {
        microhandler(() => {
          gotoReview('p/login')
          next()
        })
      }
    }
  }
}
