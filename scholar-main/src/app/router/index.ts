import {
  createRouter,
  createWebHashHistory, NavigationFailure,
  NavigationGuardNext, RouteLocation,
  RouteLocationNormalized,
  RouteRecordRaw
} from 'vue-router'
import { DemoConstructRoute } from '../views/demo-construct'
import { guard } from './guard'
import { SystemManageRoute } from '@/app/views/system-manage'
import { CourseManageRoute } from '@/app/views/course-manage'
import { ArchivesManageRoute } from '@/app/views/archives-manage'
import { ResourceManageRoute } from '@/app/views/resource-manage'
import { Bus } from '@/common/services'

const { microAppSetting, mainBase, mainLayoutIndex } = require('../../../../package.json')
const config = microAppSetting[process.env.VUE_APP_environment]
const appMainBase = '/' + mainBase
const appMainName = mainBase
/**
 * 避开子路由404拦截
 */
const generateSubpageRoute = () => {
  const subpageRoutes: Array<RouteRecordRaw> = []
  config.forEach(sub => {
    subpageRoutes.push({
      path: `${sub.activeRule.split('/#')[1]}:catchAll(.*)*`,
      name: sub.name,
      component: () => import(/* webpackChunkName: "sub-page" */ '@layout/SubPage.vue'),
      meta: {
        name: sub.name
      }
    })
  })
  return subpageRoutes
}
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'index',
    redirect: `${appMainBase}${mainLayoutIndex}`,
    meta: {
      name: '入口'
    }
  },
  {
    path: appMainBase,
    component: () => import(/* webpackChunkName: "scholar" */ '@layout/AppMain.vue'),
    name: appMainName,
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
      DemoConstructRoute('demo-construct/:id'),
      SystemManageRoute('system'),
      CourseManageRoute('course-manage'),
      ArchivesManageRoute('archives-manage'),
      ResourceManageRoute('rm'),
      {
        path: ':catchAll(.*)*',
        component: () => import(/* webpackChunkName: "main-not-found" */ '@layout/MainNotFound.vue'),
        name: 'main-not-found',
        meta: {
          name: 'main-not-found'
        }
      }
    ]
  },
  {
    path: '/p/login',
    component: () => import(/* webpackChunkName: "login" */ '@layout/Login.vue'),
    name: 'login',
    meta: {
      name: '登录'
    }
  },
  ...generateSubpageRoute(),
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

router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => guard(to, from, next))
router.afterEach((to: RouteLocationNormalized, from: RouteLocationNormalized, failure?: NavigationFailure | void) => {
  if (to.path.indexOf(appMainBase) > -1 && to.path !== from.path) {
    Bus.$emit('routerChange')
  }
})
export default router
