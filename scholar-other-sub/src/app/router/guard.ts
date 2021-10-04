import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { SharedModule } from '@/common/services'
import { win } from '@/common/base'
const { name } = require('../../../package.json')
const { microAppSetting } = require('../../../../package.json')
const currentSetting = microAppSetting[process.env.VUE_APP_environment].filter(item => item.name === name)[0]
const mainSub = currentSetting.activeRule.split('#')
const sub = mainSub[1]
const subName = sub.split('/')[1]
declare const window: win
const gotoReview = (path) => {
  const hashArr = location.href.split('#')
  let preQuery = ''
  let afterQuery = ''
  if (hashArr && hashArr[0]) {
    let preHash
    if (location.port) {
      preHash = hashArr[0].split(location.port)
    } else {
      preHash = hashArr[0].split(location.host)
    }
    if (preHash && preHash[1]) {
      preQuery = preHash[1]
    }
  }
  if (hashArr && hashArr[1]) {
    const afterHash = hashArr[1].split('?')
    if (afterHash && afterHash[1]) {
      afterQuery = afterHash[1]
    }
  }
  location.href = location.protocol + '//' + location.host + (preQuery || '/') + '#/' + path + (afterQuery ? '?' + afterQuery : '')
}
export const guard = (to:RouteLocationNormalized, from:RouteLocationNormalized, next:NavigationGuardNext) => {
  const userInfo = SharedModule.getShared().getUserInfo()
  const token = userInfo.token
  if (to.path === sub + '/login') {
    if (token) {
      gotoReview(subName + '/home')
      next()
    } else {
      next()
    }
  } else {
    if (token) {
      next()
    } else {
      if (window.__POWERED_BY_QIANKUN__) {
        gotoReview('login')
        next()
      } else {
        gotoReview(subName + '/login')
        next()
      }
    }
  }
}
