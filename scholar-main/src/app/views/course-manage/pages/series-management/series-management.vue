<template>
  <div class='container'>
    <div class="header">
      <div class="title">
        系列管理
        <a-button class="back-btn"  @click="gotoback()">返回</a-button>
      </div>
      <div class='search-content'>
        <div class='search-item'>
          <div class='search-label pt5'>
            所属课程：
          </div>
          <a-spin :spinning='loading' :delay='1000'>
            <a-select v-model:value="selectedVal"
                      class='item-select'
                      placeholder="请选择所属课程"
                      showSearch
                      @change="storingData"
                      :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'>
              <a-select-option :value="item.id"
                               :key='item.id'
                               v-for='item in courseList'
              >{{item.name}}
              </a-select-option>
            </a-select>
          </a-spin>
        </div>
        <a-button class="notice-btn" type="primary" @click="searchData('button')">查询</a-button>
        <a-button type="primary" class="notice-btn" @click="seriesOpterate({})">新增系列</a-button>
      </div>
    </div>
    <div class='table-container' id='tableScroll'>
      <a-table :data-source="data"
               :loading='loading'
               :pagination='pagination'
               :scroll='{y: "100%"}'
               @change='searchList'
      >
        <a-table-column key="seqFont"
                        title='序号'
                        data-index="seqFont"
                        width='50px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="name"
                        title='系列名称'
                        data-index="name">
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="ruleType"
                        title='排课规则'
                        data-index="ruleType">
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ getRuleType(text) }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="courseName"
                        title='所属课程'
                        data-index="courseName">
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>

        <a-table-column key="pkgNum"
                        title='课包数量'
                        data-index="pkgNum">
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>

        <a-table-column key="lastModifiedTime" title='更新时间' data-index="lastModifiedTime" >
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ getDate(text) }}
                </span>
          </template>
        </a-table-column>

        <a-table-column key="action" title="操作" width='170px'>
          <template #default="{ record }">
              <span>
                <a-button type='link' @click='seriesOpterate(record)' style='padding:0;'>编辑</a-button>
                                <a-divider type="vertical" style='margin:0 10px'/>
                <a-button type='link' @click='del(record)' style='padding:0;color:red;'>删除</a-button>
              </span>
          </template>
        </a-table-column>
      </a-table>
    </div>
    <a-modal v-model:visible="departmentBulletVisible"
             title="系列"
             :closable='true'
             @cancel='departmentBulletVisible = false;departmentBulletFormRef.clearValidate()'
             :maskClosable='false'
    >
      <template #footer>
        <a-button key="back" @click="departmentBulletVisible = false;departmentBulletFormRef.clearValidate()">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="departmentBulletConfirm">保存</a-button>
      </template>
      <a-form :model="departmentBulletFormState"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 18 }"
              :rules="departmentBulletFormRules"
              ref="departmentBulletFormRef"
              class='common-modal'>
        <a-form-item label="系列名称"
                     name="name"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
                     allowClear>
          <a-input v-model:value="departmentBulletFormState.name" placeholder="请输入系列名称"/>
          <span :style="{
                  marginTop: '2px',
                  position:'absolute',
                  right:'-40px',
                  color:departmentBulletFormState.name?.length>25? 'red':'inherit'
                }"
          >
          {{departmentBulletFormState.name?.length || 0}}/25</span>
        </a-form-item>
        <a-form-item label="排课规则" name="ruleType" hasFeedback>
          <a-select v-model:value="departmentBulletFormState.ruleType" placeholder="请选择排课规则" allowClear showSearch
                    :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'>
            <a-select-option value="1" key='1'>自由排课
            </a-select-option>
            <a-select-option value="2" key='2'>只升不降
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="所属课程" name="courseId" hasFeedback>
          <a-select
            v-model:value="departmentBulletFormState.courseId"
            placeholder="请选择所属课程"
            showSearch
            :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'>
            allowClear
          >
            <a-select-option :value="course.id" v-for='course in courseList' :key='course.id'>{{course.name}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="创建人" v-if='isEdit'>
          <a-input v-model:value="curEditData.createrName" disabled/>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts">
import SeriesManagement from './series-management'
export default SeriesManagement
</script>
<style lang="less" scoped>
  @import './series-management';
</style>
