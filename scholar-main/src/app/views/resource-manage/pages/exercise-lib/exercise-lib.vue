<template>
  <div class="container">
    <a-spin :spinning='isLoading' tip='连接开元题库系统中' size='large' :delay='1000'>
      <iframe v-if='url'
              id='iframe'
              allowfullscreen='true'
              :src="url"
              style="width: 100%;height:100%;border: none;">
      </iframe>
    </a-spin>
  </div>
</template>

<script lang="ts">
import ExerciseLib from './exercise-lib'
export default ExerciseLib
</script>
<style lang="less" scoped>
@import './exercise-lib';
</style>
