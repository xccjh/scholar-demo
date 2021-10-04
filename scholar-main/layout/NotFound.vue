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

export default defineComponent({
  name: 'not-found',
  setup () {
    const router:Router = useRouter()
    const route:RouteLocationNormalizedLoaded = useRoute()
    return {
      goHome () {
        router.push({
          name: 'home',
          query: route.query
        })
      }
    }
  }
})
</script>
