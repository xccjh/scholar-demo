<template>
  <div class="scholar-other-sub-index">
    <div id="nav">
      <h1>This is an scholar-other-sub-index page</h1>
      <router-link :to="{ name: 'home'}">home</router-link>
      |
      <router-link :to="{ name: 'demo-construct', query: { id: '0' },params: { id: '1' }}">demo-construct</router-link>
      <br/>
      <template v-if='qiankun'>
        <a @click='toLogin($event)' >scholar-main:home</a>
        |
        <a @click='toDemoConstruct($event)' v-if='qiankun'>scholar-main:demo-construct</a>
        <br/>
        <a @click='toOtherHome($event)'>scholar-sub：home</a>
        |
        <a @click='toOtherDemoConstruct($event)'>scholar-sub：demo-construct</a>
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
  name: 'scholar-other-sub-index',
  setup () {
    const router: Router = useRouter()
    const instance = getCurrentInstance()
    let qiankun
    if (instance) {
      qiankun = instance.appContext.config.globalProperties.qiankun
    }
    const toLogin = (e) => {
      router.push({
        path: `/${mainBase}/home`
      })
      e.stopPropagation()
      e.preventDefault()
    }
    const toDemoConstruct = (e) => {
      router.push({
        path: `/${mainBase}/demo-construct/1`,
        query: {
          id: 0
        }
      })
      e.stopPropagation()
      e.preventDefault()
    }
    const toOtherDemoConstruct = (e) => {
      router.push({
        path: '/scholar-sub/demo-construct/1',
        query: {
          id: 0
        }
      })
      e.stopPropagation()
      e.preventDefault()
    }
    const toOtherHome = (e) => {
      router.push({
        path: '/scholar-sub/home'
      })
      e.stopPropagation()
      e.preventDefault()
    }
    return {
      toLogin,
      toDemoConstruct,
      toOtherDemoConstruct,
      toOtherHome,
      qiankun,
      imgUrl: require('@images/logo.png')
    }
  }
})
</script>
