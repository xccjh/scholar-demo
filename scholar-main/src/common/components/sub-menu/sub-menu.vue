<template>
  <a-sub-menu :key="menuInfo.link || menuInfo.text" v-bind="$attrs"  v-if='menuInfo.isVisible==="1"'>
    <template #title :style='{paddingLeft:`${item.level*15}px`}'>
        <span>
       <menu-icon :icon='menuInfo.icon'></menu-icon>
          <span>{{ menuInfo.text }}</span>
        </span>
    </template>
    <template v-for="item in menuInfo.children">
      <template v-if="!item.children  && item.isVisible==='1'">
        <a-menu-item :key="item.link || menuInfo.text" :style='{paddingLeft:`${item.level*15}px`}' :title='item.text'>
          <menu-icon :icon='item.icon'></menu-icon>
          <span>{{ item.text }}</span>
        </a-menu-item>
      </template>
      <template v-else>
        <sub-menu :menu-info="item" :key="item.link || menuInfo.text" />
      </template>
    </template>
  </a-sub-menu>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'SubMenu',
  props: {
    menuInfo: {
      type: Object,
      default: () => ({})
    }
  }
})
</script>
