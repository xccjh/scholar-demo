import {
  createRouter,
  createWebHashHistory,
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteRecordRaw
} from 'vue-router'
import { DemoConstructRoute } from '../views/demo-construct'
import { guard } from './guard'
const { name } = require('../../../package.json')
const { microAppSetting, mainBase } = require('../../../../package.json')
const currentSetting = microAppSetting[process.env.VUE_APP_environment].filter(item => item.name === name)[0]
const mainSub = currentSetting.activeRule.split('/#')
const main = '/' + mainBase
const sub = mainSub[1]
const localRoute = {
  path: sub,
  name: 'base-construct',
  meta: { name: 'base-construct' },
  component: () => import(/* webpackChunkName: "base-construct" */ '@layout/BaseConstruct.vue'),
  children: [
    {
      path: '',
      name: 'scholar-other-sub-index',
      component: () => import(/* webpackChunkName: "scholar-other-sub-index" */ '@layout/AppOtherSubIndex.vue'),
      meta: {
        name: '主页'
      },
      children: [
        {
          path: 'home',
          component: () => import(/* webpackChunkName: "home" */ '@layout/Home.vue'),
          name: 'home',
          meta: {
            name: '首页'
          }
        },
        DemoConstructRoute('demo-construct/:id')
      ]
    },
    {
      path: 'login',
      component: () => import(/* webpackChunkName: "login" */ '@layout/Login.vue'),
      name: 'login',
      meta: {
        name: '登录页'
      }
    }
  ]
}
const mainRoute = {
  path: main,
  name: 'micro-base-construct',
  meta: { name: 'base-construct' },
  component: () => import(/* webpackChunkName: "base-construct" */ '@layout/BaseConstruct.vue'),
  children: [
    {
      path: '',
      name: 'micro-scholar-other-sub-index',
      component: () => import(/* webpackChunkName: "scholar-other-sub-index" */ '@layout/AppOtherSubIndex.vue'),
      meta: {
        name: '主页'
      },
      children: [
        {
          path: 'home',
          component: () => import(/* webpackChunkName: "home" */ '@layout/Home.vue'),
          name: 'micro-home',
          meta: {
            name: '首页'
          }
        },
        DemoConstructRoute('demo-construct/:id', 'micro-demo-construct')
      ]
    },
    {
      path: 'login',
      component: () => import(/* webpackChunkName: "login" */ '@layout/Login.vue'),
      name: 'micro-login',
      meta: {
        name: '登录页'
      }
    }
  ]
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'index',
    redirect: sub + '/home',
    meta: {
      name: '入口'
    }
  },
  localRoute,
  mainRoute,
  {
    path: '/:catchAll(.*)*',
    name: 'not-found',
    component: () => import(/* webpackChunkName: "not-found" */ '@layout/NotFound.vue'),
    meta: {
      name: 'not-found'
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to:RouteLocationNormalized, from:RouteLocationNormalized, next:NavigationGuardNext) => guard(to, from, next))

export default router
