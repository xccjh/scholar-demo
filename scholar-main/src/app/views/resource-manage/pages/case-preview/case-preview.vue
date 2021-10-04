<template>
  <div class='container'>
    <div class='header'>
        <div class='title fl'>{{data.title}}</div>
      <div class='fr mr20'>
        <a-button class='mr20' @click='gotoBack'>返回</a-button>
        <FullscreenExitOutlined v-if='fullScreen' @click='enterFullscreen(false)'  class='mr20'/>
        <FullscreenOutlined v-else @click='enterFullscreen(true)' class='mr20'/>
      </div>
    </div>
    <div class='body'>
      <div class='left'>
        <a-menu
          mode="inline"
          @click="handleClick"
          v-model:selectedKeys="selectedKeys"
        >
            <a-menu-item :key="1">案例背景</a-menu-item>
            <a-menu-item :key="2">案例解析</a-menu-item>
            <a-menu-item :key="3">教学指导</a-menu-item>
        </a-menu>
      </div>
      <div class='middle'>
        <div id="materialSection1" class='editor-container'>
          <p class='tl'>案例背景</p>
          <ckeditor :editor="ClassicEditor" disabled
                    :config="config" v-model='data.background'></ckeditor>
        </div>
        <div id="materialSection2" class='editor-container'>
          <p class='tl'>案例解析</p>
          <ckeditor :editor="ClassicEditor" disabled
                    :config="config" v-model='data.analysis'></ckeditor>
        </div>

        <div id="materialSection3" class='editor-container'>
          <p class='tl'>教学指导</p>
          <ckeditor :editor="ClassicEditor" disabled
                    :config="config" v-model='data.guide'></ckeditor>
        </div>
      </div>
      <div class='right'>
        <a-divider>附件列表</a-divider>
          <a class="attach-block" @click="previewAttachment(item)" v-for="item in data.caseAttch" :key='item.id'>
            <img v-if="item?.isPic" :src="item?.attachmentPath" alt="thumbnail" class='image'>
            <img v-if="!item?.isPic&&item?.thumbnail" :src="item?.thumbnail" alt="thumbnail" class='image'>
            <span class='name'>{{ item.attachmentName }}</span>
          </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import CasePreview from './case-preview'
export default CasePreview
</script>
<style lang="less" scoped>
@import './case-preview';
</style>
