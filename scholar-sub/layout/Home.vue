<template>
  <div class="home">
    <h1>This is an scholar-sub home page</h1>
    <h1>Welcome To Use SEEAI Template</h1>
    <a-button @click='setUserInfo()' v-if='qiankun'>modify global store</a-button>
    <div>
      <img :src='imgUrl' alt=''>
    </div>
    <pre>
      {{userInfoReactive}}
    </pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, toRaw, reactive, ref } from 'vue'
import { QiankunActionsInstance, SharedModule } from '../src/common/services'
import { win } from '@/common/base'

declare const window: win
export default defineComponent({
  name: 'home',
  setup () {
    const shared = SharedModule.getShared()
    const userInfo = shared.getUserInfo()
    const userInfoReactive = ref(userInfo)
    const setUserInfo = () => {
      shared.setUserInfo({ ...userInfo, nickName: 'testChange' })
      userInfoReactive.value = shared.getUserInfo()
    }
    onMounted(() => {
      QiankunActionsInstance.onGlobalStateChange((state, prev) => {
        // state: 变更后的状态; prev 变更前的状态
        console.log('来自其他应用的调用')
      })
      // 使用 shared 获取 token
      console.log(userInfo, 'sub-scholar-userInfo')
    })
    return {
      imgUrl: require('@images/logo.png'),
      setUserInfo,
      userInfoReactive,
      qiankun: window.__POWERED_BY_QIANKUN__
    }
  }
})
</script>
