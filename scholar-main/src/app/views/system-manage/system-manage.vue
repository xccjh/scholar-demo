<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="keepLiveRoute">
      <component :is="Component" >
      </component>
    </keep-alive>
  </router-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapGetters } from 'vuex'

export default defineComponent({
  name: 'system-manage',
  computed: {
    ...mapGetters(['keepLiveRoute'])
  },
  setup () {
    return {
    }
  }
})
</script>
<style lang="less" scoped>
  .p {
    font-size:60px!important;
  }
</style>
