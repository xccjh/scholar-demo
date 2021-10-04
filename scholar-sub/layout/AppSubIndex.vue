<template>
  <div class="scholar-sub-index">
    <div id="nav">
      <h1>This is an scholar-sub-index page</h1>
      <router-link :to="{ name: 'home'}">home</router-link>
      |
      <router-link :to="{ name: 'demo-construct', query: { id: '0' },params: { id: '1' }}">demo-construct</router-link>
      <br/>
      <template v-if='qiankun'>
        <a @click='toLogin($event)' >scholar-main：home</a>
        |
        <a @click='toDemoConstruct($event)'>scholar-main：demo-construct</a>
        <br/>
        <a @click='toOtherHome($event)'>scholar-other-sub：home</a>
        |
        <a @click='toOtherDemoConstruct($event)'>scholar-other-sub：demo-construct</a>
      </template>
    </div>
    <router-view/>
  </div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance } from 'vue'
import { RouteLocationNormalized, Router, useRoute, useRouter } from 'vue-router'
const { mainBase } = require('../../package.json')

export default defineComponent({
  name: 'scholar-sub-index',
  setup () {
    const router: Router = useRouter()
    const instance = getCurrentInstance()
    let qiankun
    if (instance) {
      qiankun = instance.appContext.config.globalProperties.qiankun
    }
    const routerChange = (e, param) => {
      router.push(param)
      e.stopPropagation()
      e.preventDefault()
    }

    const toLogin = (e) => {
      routerChange(e, {
        path: `/${mainBase}/home`
      })
    }
    const toDemoConstruct = (e) => {
      routerChange(e, {
        path: `/${mainBase}/demo-construct/1`,
        query: {
          id: 0
        }
      })
    }
    const toOtherDemoConstruct = (e) => {
      routerChange(e, {
        path: '/scholar-other-sub/demo-construct/1',
        query: {
          id: 0
        }
      })
    }
    const toOtherHome = (e) => {
      routerChange(e, {
        path: '/scholar-other-sub/home'
      })
    }
    return {
      toLogin,
      toDemoConstruct,
      toOtherHome,
      toOtherDemoConstruct,
      qiankun,
      imgUrl: require('@images/logo.png')
    }
  }
})
</script>
