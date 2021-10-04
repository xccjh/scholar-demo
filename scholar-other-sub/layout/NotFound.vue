<template>
  <a-result status="404" title="404" sub-title="Sorry, the page you visited does not exist.">
    <template #extra>
      <a-button type="primary" @click='goHome()'>返回首页</a-button>
    </template>
  </a-result>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouteLocationNormalizedLoaded, Router, useRoute, useRouter } from 'vue-router'
import { win } from '@/common/base'
declare const window: win
const { name } = require('../package.json')
const { microAppSetting, appMainBase } = require('../../package.json')
const currentSetting = microAppSetting[process.env.VUE_APP_environment].filter(item => item.name === name)[0]
const mainSub = currentSetting.activeRule.split('/#')
const main = '/' + appMainBase
export default defineComponent({
  name: 'not-found',
  setup () {
    const router:Router = useRouter()
    const route:RouteLocationNormalizedLoaded = useRoute()
    return {
      goHome () {
        if (window.__POWERED_BY_QIANKUN__) {
          router.push({
            path: main + '/home',
            query: route.query
          })
        } else {
          router.push({
            name: 'home',
            query: route.query
          })
        }
      }
    }
  }
})
</script>
