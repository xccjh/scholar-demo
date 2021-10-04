<template>
  <a-layout class='container'>
    <div class='main-header'>
      课程查询
    </div>
    <div class='content-header'>
      <label style='min-width:78px'>关键词搜索：</label>
      <a-input placeholder="支持课程编号/课程名称/负责人"
               v-model:value="searchWordVal"
               style='width:250px;'
               @pressEnter='searchData("button")'
               @change="storingData"
      />
      <label style='min-width:78px;margin-left: 20px;'>审批状态：</label>
      <a-select
        v-model:value="selectedVal"
        @change="storingData"
        allowClear
        class='common-select'
        placeholder="请选择课程状态"
      >
        <a-select-option value="">全部</a-select-option>
<!--        <a-select-option value="0">草稿</a-select-option>-->
        <a-select-option value="1">待审批</a-select-option>
        <a-select-option value="2">标准</a-select-option>
        <a-select-option value="3">未通过</a-select-option>
      </a-select>
      <label style='min-width:78px;margin-left: 20px;'>提交时间：</label>
      <a-range-picker v-model:value="dateRangeVal" @change='storingData'/>
      <a-button type="primary" style='margin-left:20px;' @click="searchData('button')">查询</a-button>
      <a-button type="primary" style='margin-left:20px;' @click="resetData()">重置</a-button>
    </div>
    <a-layout-content style="padding: 15px 20px 20px;" class="content">
      <div class='table-container' id='tableScroll'>
        <a-table :data-source="data"
                 :loading='loading'
                 :pagination='pagination'
                 :scroll='{x:1050,y: "100%"}'
                 @change='searchList'
        >
          <a-table-column key="code"
                          title='课程编号'
                          fixed='left'
                          data-index="code"
                          width='120px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="name"
                          fixed='left'
                          title='课程名称'
                          data-index="name"
                          width='200px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column :key='orgCode === "zksd" ? "majorNames" : "majorName"'
                          :title="orgCode === 'zksd' ? '所属专业' : '所属学科'"
                          :data-index='orgCode === "zksd" ? "majorNames" : "majorName"'
                          width='200px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="leaderName" title='负责人' data-index="leaderName" width='120px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="billDate" title='提交时间' data-index="billDate" width='120px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ getDate(text) }}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="auditDate" title='审批时间' data-index="auditDate" width='120px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ getDate(text) }}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="auditStatusName" title='审批状态' data-index="auditStatusName" width='120px'>
            <template #default="{ text,record }">
                <span :class='{"synopsis-text":true,"red":record.auditStatus==="3","green":record.auditStatus==="2","orange":record.auditStatus==="1"}'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="action" title="操作" width='50px' fixed='right'>
            <template #default="{ record }">
              <span>
                <a-button type='link' @click='preview(record)' style='padding:0;'>预览</a-button>
              </span>
            </template>
          </a-table-column>
        </a-table>
      </div>
    </a-layout-content>

  </a-layout>
</template>

<script lang="ts">
import CourseIInitiated from './course-i-initiated'
export default CourseIInitiated
</script>
<style lang="less" scoped>
@import './course-i-initiated';
</style>
