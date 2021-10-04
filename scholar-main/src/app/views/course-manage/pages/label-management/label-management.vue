<template>
  <div class='container'>
    <div class="header">
      <div class="title">
        标签管理
        <a-button class="back-btn" @click="gotoback()">返回</a-button>
      </div>
      <div class='search-content'>
        <div class='search-item'>
          <div class='search-label pt5'>
            关键词搜索：
          </div>
          <a-input placeholder="支持标签名称"
                   v-model:value="nameVal"
                   style='margin-right:15px;'
                   class='item-select'
                   @pressEnter='searchData("button")'
                   @change="storingData"
          />
        </div>
        <div class='search-item'>
          <div class='search-label pt5'>
            标签类型：
          </div>
          <a-select v-model:value="tagTypeVal"
                    class='item-select'
                    style='text-align:left;'
                    placeholder="请选择标签类型"
                    showSearch
                    @change="storingData"
                    :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'>
            <a-select-option value=""
                             key=''

            >全部
            </a-select-option>
            <a-select-option value="1"
                             key='1'

            >阶段标签
            </a-select-option>
            <a-select-option value="2"
                             key='2'

            >考期标签
            </a-select-option>
          </a-select>
        </div>
        <a-button class="notice-btn" type="primary" @click="searchData('button')">查询</a-button>
        <a-button class="notice-btn" type="primary" @click="resetData()">重置</a-button>
      </div>
    </div>
    <a-layout-content style="padding: 15px 20px 20px;" class="content">
      <div class="body-header">
        <a-button type="primary"
                  @click="lableOpterate({})"
                  style="margin-bottom:20px;"
        >新增标签
        </a-button>
      </div>
      <div class='table-container' id='tableScroll'>
        <a-table :data-source="data"
                 :loading='loading'
                 :pagination='pagination'
                 :scroll='{y: "100%"}'
                 @change='searchList'
        >
          <a-table-column key="id"
                          width='260px'
                          title='标签编号'
                          data-index="id">
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="tagType"
                          title='标签类型'
                          data-index="tagType">
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ getTagType(text) }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="name"
                          title='标签名称'
                          data-index="name">
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="lastModifiedTime" title='更新时间' data-index="lastModifiedTime">
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ getDate(text) }}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="usedCoursePacketNumber"
                          data-index="usedCoursePacketNumber">
            <template #title>使用数量
              <a-tooltip :overlayStyle='{"max-width": "190px"}' trigger='click'>
                <template #title>
                  使用该标签的课包总数。
                </template>
                <QuestionCircleOutlined class='font-question'/>
              </a-tooltip>
            </template>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="action" title="操作" width='170px'>
            <template #default="{ record , index}">
              <span>
                <a-button type='link' @click='lableOpterate(record)' style='padding:0;'>编辑</a-button>
                                <a-divider type="vertical" style='margin:0 10px'/>
                  <a-button type='link' @click='moveUp(record)' style='padding:0;' :disabled='index===0'>上移</a-button>
                                <a-divider type="vertical" style='margin:0 10px'/>
                  <a-button type='link' @click='moveDown(record)' style='padding:0;' :disabled='index===data.length-1'>下移</a-button>
                                <a-divider type="vertical" style='margin:0 10px'/>
                <a-button type='link' @click='del(record)' style='padding:0;color:red;'>删除</a-button>
              </span>
            </template>
          </a-table-column>
        </a-table>
      </div>
    </a-layout-content>
    <a-modal v-model:visible="lableManageVisible"
             :title="isEdit?'编辑标签':'新增标签'"
             :closable='true'
             @cancel='lableManageVisible = false;lableManageFormRef.clearValidate()'
             :maskClosable='false'
    >
      <template #footer>
        <a-button key="back" @click="lableManageVisible = false;lableManageFormRef.clearValidate()">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="lableManageConfirm">保存</a-button>
      </template>
      <a-form :model="lableManageFormState"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 18 }"
              :rules="lableManageFormRules"
              ref="lableManageFormRef"
              class='common-modal'>
        <a-form-item label="标签名称"
                     name="name"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
                     allowClear>
          <a-input v-model:value="lableManageFormState.name" placeholder="请输入标签名称"/>
          <span :style="{
                  marginTop: '2px',
                  position:'absolute',
                  right:'-40px',
                  top:'4px',
                  color:lableManageFormState.name?.length>6? 'red':'inherit'
                }"
          >
          {{lableManageFormState.name?.length || 0}}/6</span>
        </a-form-item>
        <a-form-item label="标签类型" name="type" hasFeedback>
          <a-select v-model:value="lableManageFormState.type"
                    placeholder="请选择排课规则"
                    allowClear
                    showSearch
                    :disabled='isEdit'
                    :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'>
            <a-select-option value="1" key='1'>阶段标签
            </a-select-option>
            <a-select-option value="2" key='2'>考期标签
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts">
import LabelManagement from './label-management'

export default LabelManagement
</script>
<style lang="less" scoped>
  @import './label-management';
</style>
