<template>
  <a-layout class='container'>
    <div class='main-header'>
      课包查询
    </div>
    <div class='content-header'>
      <label style='min-width:78px'>关键词搜索：</label>
      <a-input placeholder="支持课包编号/课包名称"
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
        placeholder="请选择课包状态"
      >
        <a-select-option value="1,2,3">全部</a-select-option>
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
                 :scroll='{x:1330,y: "100%"}'
                 @change='searchList'
        >
          <a-table-column key="pcode"
                          title='课包编号'
                          data-index="pcode"
                          fixed='left'
                          width='200px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="name"
                          title='课包名称'
                          fixed='left'
                          data-index="name"
                          width='200px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="courseName"
                          title='所属课程'
                          data-index="courseName"
                          width='200px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key='majorName'
                          :title="orgCode === 'zksd' ? '所属专业' : '所属学科'"
                          data-index='majorName'
                          width='200px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="nickName" title='提交人' data-index="nickName" width='120px'>
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

          <a-table-column key="auditStatus" title='审批状态' data-index="auditStatus" width='120px'>
            <template #default="{ text }">
                <span :class='{"synopsis-text":true,"red":text==="3","green":text==="2","orange":text==="1"}'>
                  {{ getAuditStatusPkg(text) }}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="action" title="操作" width='50px' fixed='right'>
            <template #default="{ record }">
                <a-button type='link' @click='preview(record)' style='padding:0;' v-if='delIf(record)'>预览</a-button>
                <span v-else>--</span>
            </template>
          </a-table-column>
        </a-table>
      </div>
    </a-layout-content>

  </a-layout>
</template>
<script lang="ts">
import PkgIInitiated from './pkg-i-initiated'
export default PkgIInitiated
</script>
<style lang="less" scoped>
@import './pkg-i-initiated';
</style>
