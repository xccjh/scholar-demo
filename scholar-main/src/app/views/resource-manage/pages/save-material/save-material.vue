<template>
  <div style='height:100%;'>
    <save-read v-if='materialType && materialType !=="104"' :key='0'></save-read>
    <save-case v-if='materialType && materialType ==="104"' :key='1'></save-case>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import SaveRead from '../save-read/save-read.vue'
import SaveCase from '../save-case/save-case.vue'
import { RouteLocationNormalizedLoaded, useRoute } from 'vue-router'
export default defineComponent({
  name: 'case-preview',
  components: {
    SaveRead,
    SaveCase
  },
  setup () {
    const route:RouteLocationNormalizedLoaded = useRoute()
    const materialType = ref('')
    materialType.value = route.params.materialType as string
    return {
      materialType
    }
  }
})

</script>
