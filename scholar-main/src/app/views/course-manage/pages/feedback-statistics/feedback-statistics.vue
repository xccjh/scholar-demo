<template>
  <div class='container'>
    <div class="header">
      <div class="title">
        反馈统计
        <a-button class="back-btn" @click="gotoback()">返回</a-button>
      </div>
      <div class='search-content'>
        <div class='search-item'>
          <div class='search-label pt5'>
            关键词搜索：
          </div>
          <a-input placeholder="支持讲师姓名 /手机号码"
                   v-model:value="searchWordVal"
                   style='width:60%;margin-right: 20px;'
                   @pressEnter='searchData("button")'
                   @change="storingData"
          />
        </div>
        <a-button class="notice-btn" type="primary" @click="searchData('button')">查询</a-button>
        <a-button type="primary" style='margin-left:20px;' @click="resetData()">重置</a-button>
      </div>
    </div>
    <div class='table-container' id='tableScroll'>
      <a-table :data-source="data"
               :loading='loading'
               :pagination='pagination'
               :scroll='{y: "100%"}'
               @change='searchList'
      >
        <a-table-column key="teacherName"
                        title='讲师姓名'
                        data-index="teacherName"
                        width='200px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="telphone"
                        title='手机号码'
                        data-index="telphone">
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="chapterName"
                        title='所属章节'
                        data-index="chapterName">
          <template #default="{ text ,record}">
                <span class='synopsis-text'>
                  {{ text +'-' + record.sectionName}}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="description"
                        title='问题描述'
                        data-index="description">
          <template #default="{ text }">
            <a-tooltip :title='text' >
               <span class='synopsis-text pr10' >
                  {{ text }}
                </span>
            </a-tooltip>
          </template>
        </a-table-column>
        <a-table-column key="pictures"
                        title='图片'
                        data-index="pictures">
          <template #default="{text , index}">
            <div :id='"img-container" + index' @click='previewImg("img-container" + index)'>
              <img :src='getImageFullPath(item.pictureUrl)' alt='' v-for='(item,j) in text' :key='item.id'
                   style='width:50px;height:50px;cursor:pointer;margin-left: -18px;' v-show='j===0'
                  >
            </div>
          </template>
        </a-table-column>
        <a-table-column key="createTime" title='反馈时间' data-index="createTime">
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ getDate(text) }}
                </span>
          </template>
        </a-table-column>
      </a-table>
    </div>
  </div>
</template>
<script lang="ts">
import FeedbackStatistics from './feedback-statistics'

export default FeedbackStatistics
</script>
<style lang="less" scoped>
  @import './feedback-statistics';
</style>
