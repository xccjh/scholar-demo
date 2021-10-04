<template>
  <div class='container'>
    <div class="header">
      <div class="title">
        操作日志
        <a-button class="back-btn"  @click="gotoback()">返回</a-button>
      </div>
      <div class='search-content'>
        <div class='search-item'>
          <div class='search-label pt5'>
            关键词搜索：
          </div>
          <a-input placeholder="支持操作模块"
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
        <a-table-column key="userName"
                        title='操作人'
                        data-index="userName"
                        width='200px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="ip"
                        title='操作IP'
                        data-index="ip">
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="businessName"
                        title='操作模块'
                        data-index="businessName">
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="actionName"
                        title='操作内容'
                        data-index="actionName">
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>

        <a-table-column key="createTime" title='更新时间' data-index="createTime" >
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
import OperationLog from './operation-log'
export default OperationLog
</script>
<style lang="less" scoped>
  @import './operation-log';
</style>
