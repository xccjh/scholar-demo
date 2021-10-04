<template>
  <a-layout class='container'>
    <div class='header'>
      <span class='fl mr20 fs18'>{{currentCourseName}}</span>
      <a-dropdown class='fl mt5' :overlayStyle='{"max-height":"500px",overflow:"auto"}' trigger='click' v-if="fromOrigin!=='scp'">
        <a class="ant-dropdown-link" @click.prevent>
          切换
          <DownOutlined />
        </a>
        <template #overlay>
          <a-menu>
            <a-menu-item v-for='item in courseList' :key='item.code'>
              <a href="javascript:;" @click='selectCourse(item)'>{{item.name}}</a>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      <a-button type="primary" class='fr mt5' @click="completeCall()" v-if="fromOrigin==='scp'">完成调用</a-button>
      <a-button type='primary' class='fr mt5' @click='addCaseMaterials' v-else>
        新增案例
      </a-button>
    </div>
    <div class='body-content'>
      <div class='left-container'>
        <a-tree
          class='fix-title'
          @select='treeNodeClick'
          :defaultExpandAll='true'
          style='text-align:left'
          :tree-data="treeData"
          :replaceFields='{title:"name",key:"id"}'
          v-if='treeData.length'
          :showLine='true'
        >
        </a-tree>
      </div>
      <div class='right-container'>
        <div class='content-header'>
          <div class='header-item'>
            <label style='min-width:78px'>关键词搜索：</label>
            <a-input placeholder="支持标题"
                     v-model:value="searchWordVal"
                     class='common-select w100'
                     @pressEnter='searchData("button")'
                     @change="storingData"
            />
          </div>
          <div class='header-item'>
            <label style='min-width:78px;margin-left: 20px;'>学习目标：</label>
            <a-select
              v-model:value="learningGoalCodeVal"
              @change="storingData"
              allowClear
              class='common-select w100'
              placeholder="请选择学习目标"
              mode='multiple'
            >
              <a-select-option value="1">了解</a-select-option>
              <a-select-option value="2">理解</a-select-option>
              <a-select-option value="3">掌握</a-select-option>
              <a-select-option value="4">应用</a-select-option>
              <a-select-option value="5">分析</a-select-option>
              <a-select-option value="6">创新</a-select-option>
            </a-select>
          </div>
          <div class='header-item'>
            <a-button type="primary" style='margin-left:20px;' @click="searchData('button')">查询</a-button>
            <a-button type="primary" style='margin-left:20px;' @click="resetData()">重置</a-button>
          </div>
        </div>
        <a-layout-content style="padding: 15px 20px 20px;" class="content">
          <div class='table-container fix-table-container' id='tableScroll'>
            <a-table :data-source="data"
                     :loading='loading'
                     :pagination='pagination'
                     :scroll='{x:1340,y: "100%"}'
                     @change='searchList'
            >
              <a-table-column key="title"
                              title='标题'
                              data-index="title"
                              width='220px'
                              fixed='left'>
                <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text || '--'}}
                </span>
                </template>
              </a-table-column>

              <a-table-column key="learningGoalCode" title='学习目标' data-index="learningGoalCode" width='120px'>
                <template #default="{ text }">
                <span class='synopsis-text'>
                  {{  getMaterialName(text, 'LEARNING_TARGET') }}
                </span>
                </template>
              </a-table-column>

              <a-table-column key="pointName" title='知识点' data-index="pointName" width='220px'>
                <template #default="{ text }">
                <span class='synopsis-text'>
                    <a-tooltip>
                      <template #title>{{ text || '--'}}</template>
                      {{ text || '--'}}
                    </a-tooltip>
                </span>
                </template>
              </a-table-column>

              <a-table-column key="createrName" title='创建者' data-index="createrName" width='120px'>
                <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text || '--'}}
                </span>
                </template>
              </a-table-column>

              <a-table-column key="authorName" title='作者' data-index="authorName" width='120px'>
                <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text || '--'}}
                </span>
                </template>
              </a-table-column>
              <a-table-column key="lastModifiedTime" title='更新时间' data-index="lastModifiedTime" width='120px'>
                <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ getDate(text) || '--'}}
                </span>
                </template>
              </a-table-column>

              <a-table-column key="useTime" title='使用次数' data-index="useTime" width='100px' :sortOrder='useTimeSortOrder'
                              :sorter='true'>
                <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text || '0'}}
                </span>
                </template>
              </a-table-column>
              <a-table-column key="action" title="操作" width='200px' fixed='right'>
                <template #default="{ record,index:i }">
                  <span v-if="fromOrigin!=='scp'">
                    <a-button type='link' @click='copy(record)' style='padding:0;'>复制</a-button>
                    <a-divider type="vertical" style='margin:0 5px'/>
                  </span>
                   <a-button type='link' @click='preview(record)' style='padding:0;'>预览</a-button>
                   <a-divider type="vertical" style='margin:0 5px'/>
                  <span v-if="fromOrigin!=='scp'">
                     <a-button type='link' @click='edit(record)' style='padding:0;'>编辑</a-button>
                     <a-divider type="vertical" style='margin:0 5px'/>
                     <a-button type='link' @click='del(record)' style='padding:0;color:red;' v-if='Number(record.useTime) === 0'>删除</a-button>
                  </span>
                  <span v-if="fromOrigin==='scp'">
                    <a-button @click="callResource(record, i)" v-if="!record.isCall&&permitedCall" style='padding:0;' type='link'>调用</a-button>
                    <a-divider type="vertical" style='margin:0 5px'/>
                    <a-button class="light-color"
                              @click="cancelCallResource(record, i)"
                              style='padding:0;'
                              type='link'
                              v-if="record.isCall && !callResourceData.isStandard"
                    >取消调用</a-button>
                    <a-divider type="vertical" style='margin:0 5px'/>
                    <a-button
                      v-if="record.isCall && callResourceData.isStandard"
                      style="color: #999;padding:0;"
                      type='link'
                    >已调用</a-button>
                  </span>
                </template>
              </a-table-column>
            </a-table>
          </div>
        </a-layout-content>
      </div>
    </div>
  </a-layout>
</template>

<script lang="ts">
import CaseLib from './case-lib'
export default CaseLib
</script>
<style lang="less" scoped>
  @import './case-lib';
</style>
